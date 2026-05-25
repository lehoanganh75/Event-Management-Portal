package com.analyticsservice.service.impl;

import com.analyticsservice.client.EventClient;
import com.analyticsservice.client.LuckyDrawClient;
import com.analyticsservice.entity.EventAnalytic;
import com.analyticsservice.entity.EventSummaryReport;
import com.analyticsservice.repository.EventSummaryReportRepository;
import com.analyticsservice.service.AISummaryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.io.ByteArrayOutputStream;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;

@Service
@RequiredArgsConstructor
@Slf4j
public class AISummaryServiceImpl implements AISummaryService {

    private final EventSummaryReportRepository repository;
    private final EventClient eventClient;
    private final LuckyDrawClient luckyDrawClient;
    private final ChatClient chatClient;
    private final com.analyticsservice.repository.EventAnalyticsRepository analyticsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Value("${app.ai.local-url}")
    private String localAiUrl;

    @Override
    public EventSummaryReport generateSummary(String eventId) {
        log.info("Bắt đầu phân tích sự kiện id={}", eventId);

        try {
            // 1. Lấy dữ liệu sự kiện, đăng ký và tương tác
            Map<String, Object> eventData = eventClient.getEventById(eventId);
            List<Map<String, Object>> registrations = eventClient.getRegistrationsByEvent(eventId);

            // Safe call to lucky draw service
            Optional<Map<String, Object>> luckyDrawData = Optional.empty();
            try {
                luckyDrawData = luckyDrawClient.getLuckyDrawByEventId(eventId);
            } catch (Exception e) {
                log.warn("Không thể lấy dữ liệu Lucky Draw cho sự kiện {}: {}", eventId, e.getMessage());
            }
            // Safe call to get posts and feedbacks for calculating live metrics
            int totalLikes = 0;
            int totalComments = 0;
            double averageRating = 0.0;

            try {
                List<Map<String, Object>> posts = eventClient.getPostsByEvent(eventId);
                if (posts != null) {
                    for (Map<String, Object> post : posts) {
                        // Calculate likes
                        Map<String, Object> reactions = (Map<String, Object>) post.get("reactions");
                        if (reactions != null) {
                            totalLikes += reactions.size();
                        }
                        // Calculate comments
                        List<?> comments = (List<?>) post.get("comments");
                        if (comments != null) {
                            totalComments += comments.size();
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Không thể lấy dữ liệu bài viết (likes/comments) cho sự kiện {}: {}", eventId, e.getMessage());
            }

            try {
                List<Map<String, Object>> feedbacks = eventClient.getFeedbacksByEvent(eventId);
                if (feedbacks != null && !feedbacks.isEmpty()) {
                    double sumRating = 0;
                    for (Map<String, Object> feedback : feedbacks) {
                        Number ratingNum = (Number) feedback.get("rating");
                        if (ratingNum != null) {
                            sumRating += ratingNum.doubleValue();
                        }
                    }
                    averageRating = sumRating / feedbacks.size();
                }
            } catch (Exception e) {
                log.warn("Không thể lấy dữ liệu feedbacks (rating) cho sự kiện {}: {}", eventId, e.getMessage());
            }

            EventAnalytic analytic = analyticsRepository.findById(eventId).orElse(null);

            if (eventData == null || registrations == null) {
                throw new RuntimeException("Dữ liệu sự kiện hoặc đăng ký không đủ để phân tích");
            }

            // 2. Phân tích định lượng
            long totalRegistrations = registrations.size();
            long totalAttendances = registrations.stream()
                    .filter(r -> Boolean.TRUE.equals(r.get("checkedIn")))
                    .count();
            double attendanceRate = totalRegistrations > 0 ? (double) totalAttendances / totalRegistrations * 100 : 0;

            // Đồng bộ dữ liệu vào EventAnalytic để hiển thị biểu đồ chính xác
            if (analytic == null) {
                analytic = EventAnalytic.builder()
                        .eventId(eventId)
                        .totalRegistrations((int) totalRegistrations)
                        .totalAttendees((int) totalAttendances)
                        .totalLikes(totalLikes)
                        .totalComments(totalComments)
                        .averageRating(averageRating)
                        .build();
            } else {
                analytic.setTotalRegistrations((int) totalRegistrations);
                analytic.setTotalAttendees((int) totalAttendances);
                analytic.setTotalLikes(totalLikes);
                analytic.setTotalComments(totalComments);
                analytic.setAverageRating(averageRating);
            }
            analyticsRepository.save(analytic);


            String quantitativeSummary = String.format(
                    "Tổng đăng ký: %d\nTổng tham gia: %d\nTỷ lệ tham gia thực tế: %.2f%%",
                    totalRegistrations, totalAttendances, attendanceRate);

            if (analytic != null) {
                quantitativeSummary += String.format("\nTương tác: %d Lượt thích, %d Bình luận, Đánh giá: %.1f/5",
                        analytic.getTotalLikes(), analytic.getTotalComments(), analytic.getAverageRating());
            }

            // 3. Tạo prompt yêu cầu AI phân tích chi tiết với nội dung rõ ràng, logic
            String prompt = buildDetailedPrompt(eventData, totalRegistrations, totalAttendances, attendanceRate,
                    luckyDrawData, analytic);

            // 4. Gọi AI local (Node.js) để nhận xét, phân tích sâu
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("prompt", prompt);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            log.info("Đang gọi Local AI tại: {}", localAiUrl);

            Map<String, Object> response = restTemplate.postForObject(localAiUrl, request, Map.class);

            // Extract reply from nested structure: { "reply": { "reply": "..." } }
            Map<String, Object> replyWrapper = (Map<String, Object>) response.get("reply");
            String aiResponseRaw = (String) replyWrapper.get("reply");

            log.info("Nhận được phản hồi từ AI Local");

            // 5. Phân tích và chuyển đổi kết quả AI thành báo cáo
            EventSummaryReport report = parseAI(aiResponseRaw, eventId);

            // Nếu AI bỏ trống phần phân tích định lượng, dùng phần đã tính
            if (report.getQuantitativeAnalysis() == null || report.getQuantitativeAnalysis().isEmpty()) {
                report.setQuantitativeAnalysis(quantitativeSummary);
            }

            report.setAiProcessed(true);

            // 6. Lưu và trả về báo cáo
            return repository.save(report);

        } catch (Exception e) {
            log.error("Lỗi khi phân tích AI: {}", e.getMessage());

            return repository.save(EventSummaryReport.builder()
                    .eventId(eventId)
                    .summaryReport("Phân tích AI hiện đang không khả dụng, vui lòng thử lại sau.")
                    .quantitativeAnalysis("Không có dữ liệu phân tích")
                    .qualitativeAnalysis("Không thể thực hiện phân tích định tính")
                    .improvementProposals("Không có đề xuất")
                    .aiProcessed(false)
                    .aiErrorLog(e.getMessage())
                    .build());
        }
    }

    private EventSummaryReport parseAI(String raw, String eventId) {
        try {
            String cleaned = cleanJson(raw);
            Map<String, Object> map = objectMapper.readValue(cleaned, new TypeReference<>() {
            });

            String proposals = parseProposals(map.get("improvementProposals"));

            return EventSummaryReport.builder()
                    .eventId(eventId)
                    .quantitativeAnalysis(cleanMarkdown((String) map.get("quantitativeAnalysis")))
                    .qualitativeAnalysis(cleanMarkdown((String) map.get("qualitativeAnalysis")))
                    .summaryReport(cleanMarkdown((String) map.get("summaryReport")))
                    .improvementProposals(cleanMarkdown(proposals))
                    .build();
        } catch (Exception e) {
            log.warn("Không thể phân tích JSON từ AI, fallback: {}", e.getMessage());
            return EventSummaryReport.builder()
                    .eventId(eventId)
                    .summaryReport(cleanMarkdown(formatFallback(raw)))
                    .qualitativeAnalysis("Phản hồi AI không đúng định dạng")
                    .improvementProposals("Không thể lấy đề xuất cải tiến")
                    .build();
        }
    }

    private String cleanJson(String raw) {
        return raw.replaceAll("(?s)```json", "").replaceAll("(?s)```", "").trim();
    }

    private String cleanMarkdown(String text) {
        if (text == null)
            return "";
        return text.replaceAll("\\*\\*(.*?)\\*\\*", "$1")
                .replaceAll("\\*(.*?)\\*", "$1")
                .replaceAll("(?m)^\\s*\\*\\s*", "• ")
                .replaceAll("\\n{2,}", "\n\n")
                .trim();
    }

    private String parseProposals(Object obj) {
        if (obj instanceof List<?> list) {
            return list.stream().map(item -> "• " + item).reduce("", (a, b) -> a + "\n" + b).trim();
        }
        return obj != null ? obj.toString() : "Không có đề xuất cải tiến";
    }

    private String formatFallback(String raw) {
        return "Báo cáo sự kiện\n\nKhông thể phân tích dữ liệu AI.\nNội dung gốc:\n\n" + raw;
    }

    @Override
    public byte[] exportToWord(String eventId) {
        EventSummaryReport report = getSummaryByEventId(eventId);
        if (report == null)
            throw new RuntimeException("Không tìm thấy báo cáo để xuất file");

        try (XWPFDocument document = new XWPFDocument()) {
            // Title
            XWPFParagraph title = document.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setText("BÁO CÁO TỔNG KẾT SỰ KIỆN");
            titleRun.setBold(true);
            titleRun.setFontSize(20);
            titleRun.setFontFamily("Arial");

            addSection(document, "1. Thống kê chi tiết", report.getQuantitativeAnalysis());
            addSection(document, "2. Đánh giá chuyên sâu", report.getQualitativeAnalysis());
            addSection(document, "3. Báo cáo tổng hợp chi tiết", report.getSummaryReport());
            addSection(document, "4. Đề xuất cải tiến", report.getImprovementProposals());

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi xuất file Word: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi tạo file Word");
        }
    }

    private void addSection(XWPFDocument document, String title, String content) {
        XWPFParagraph head = document.createParagraph();
        XWPFRun headRun = head.createRun();
        headRun.setText(title);
        headRun.setBold(true);
        headRun.setFontSize(14);
        headRun.setFontFamily("Arial");
        head.setSpacingAfter(200);

        XWPFParagraph body = document.createParagraph();
        XWPFRun bodyRun = body.createRun();
        bodyRun.setText(content != null ? content : "Đang cập nhật...");
        bodyRun.setFontSize(12);
        bodyRun.setFontFamily("Arial");
        body.setSpacingAfter(400);
    }

    private String buildDetailedPrompt(Map<String, Object> event,
            long registrations,
            long attendances,
            double rate,
            Optional<Map<String, Object>> luckyDraw,
            EventAnalytic analytic) {
        String interactionData = analytic != null
                ? String.format("- Tương tác: %d lượt thích, %d bình luận, Đánh giá trung bình: %.1f/5\n",
                        analytic.getTotalLikes(), analytic.getTotalComments(), analytic.getAverageRating())
                : "";

        return String.format(
                """
                        Bạn là chuyên gia tổ chức và phân tích sự kiện cao cấp. Dựa trên dữ liệu dưới đây, vui lòng tổng hợp và phân tích cực kỳ chi tiết, chuyên nghiệp.

                        Dữ liệu sự kiện:
                        - Tiêu đề: %s
                        - Mô tả: %s
                        - Thống kê tham gia: %d đăng ký, %d tham gia thực tế (Tỷ lệ: %.2f%%)
                        %s
                        - Mini game: %s

                        Yêu cầu phân tích:
                        1. **Thống kê chi tiết**: Trình bày các con số một cách ấn tượng.
                        2. **Đánh giá chuyên sâu**: Phân tích mức độ lan tỏa, sự hài lòng của người dùng qua lượt tương tác và đánh giá. Chỉ ra ưu điểm và nhược điểm cụ thể.
                        3. **Báo cáo tổng hợp**: Tóm tắt dành cho lãnh đạo, nhấn mạnh vào giá trị sự kiện mang lại.
                        4. **Đề xuất cải tiến**: Đề xuất ít nhất 3 hành động cụ thể để tối ưu hóa sự kiện lần sau.

                        Vui lòng trả về KHÔNG có markdown, KHÔNG có dấu ```json, và phần improvementProposals phải ở dạng MẢNG (ARRAY) các chuỗi.

                        Định dạng JSON:
                        {
                          "quantitativeAnalysis": "...",
                          "qualitativeAnalysis": "...",
                          "summaryReport": "...",
                          "improvementProposals": ["...", "...", "..."]
                        }

                        Ngôn ngữ: Tiếng Việt
                        """,
                event.getOrDefault("title", ""),
                event.getOrDefault("description", ""),
                registrations,
                attendances,
                rate,
                interactionData,
                luckyDraw.isPresent() ? "Có tổ chức" : "Không tổ chức");
    }

    @Override
    public EventSummaryReport getSummaryByEventId(String eventId) {
        return repository.findById(eventId).orElse(null);
    }
}
