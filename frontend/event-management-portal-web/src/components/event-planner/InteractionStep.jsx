import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  BarChart2,
} from "lucide-react";

export default function InteractionStep({ formData, setFormData, onNext, onBack }) {
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [interactions, setInteractions] = useState(formData.interactions || []);
  const [settings, setSettings] = useState(formData.interactionSettings || {
    enableQA: true,
    enablePolls: true,
    allowUserQuestions: true,
  });

  const aiSuggestions = {
    questions: [
      "Câu hỏi nào bạn muốn hỏi diễn giả?",
      "Bạn nghĩ gì về xu hướng [chủ đề] hiện nay?",
      "Bạn muốn biết thêm về khía cạnh nào?",
      "Theo bạn, thách thức lớn nhất là gì?",
    ],
    polls: [
      {
        text: "Bạn đánh giá nội dung sự kiện như thế nào?",
        options: ["Rất hữu ích", "Hữu ích", "Bình thường", "Chưa hữu ích"]
      },
      {
        text: "Bạn có muốn tham gia sự kiện tương tự trong tương lai?",
        options: ["Chắc chắn có", "Có thể", "Chưa chắc", "Không"]
      },
      {
        text: "Chủ đề nào bạn muốn tìm hiểu thêm?",
        options: ["AI & Machine Learning", "Web Development", "Mobile App", "Data Science"]
      },
    ]
  };

  const handleSettingToggle = (field) => {
    const newSettings = { ...settings, [field]: !settings[field] };
    setSettings(newSettings);
    setFormData({ ...formData, interactionSettings: newSettings });
  };

  const addInteraction = (type, text, options = []) => {
    const newItem = {
      id: Date.now(),
      type, // 'question' or 'poll'
      text,
      options,
    };
    const newInteractions = [...interactions, newItem];
    setInteractions(newInteractions);
    setFormData({ ...formData, interactions: newInteractions });
  };

  const removeInteraction = (id) => {
    const newInteractions = interactions.filter((item) => item.id !== id);
    setInteractions(newInteractions);
    setFormData({ ...formData, interactions: newInteractions });
  };

  const [newType, setNewType] = useState('question');
  const [newText, setNewText] = useState('');

  const handleAddManual = () => {
    if (!newText.trim()) return;
    addInteraction(newType, newText, newType === 'poll' ? ['Lựa chọn 1', 'Lựa chọn 2'] : []);
    setNewText('');
  };

  const showInteractionList = settings.enableQA || settings.enablePolls;

  return (
    <div className="w-full mx-auto p-0">
      <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col gap-8">

        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Tương tác & Q&A
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập câu hỏi và cuộc bình chọn trực tiếp để tăng tương tác trong sự kiện
          </p>
        </div>

        {/* Settings Box */}
        <div className="flex items-start gap-4 p-5 bg-blue-50/40 border border-blue-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare size={20} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Tương tác với người tham dự
              </h3>
              <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                Kích hoạt hệ thống gửi câu hỏi cho diễn giả và tạo các cuộc biểu quyết/bình chọn nhanh để giữ sự kiện luôn sinh động.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 pt-1">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enableQA}
                  onChange={() => handleSettingToggle('enableQA')}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Bật tính năng Q&A
              </label>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enablePolls}
                  onChange={() => handleSettingToggle('enablePolls')}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Bật tính năng bình chọn
              </label>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.allowUserQuestions}
                  onChange={() => handleSettingToggle('allowUserQuestions')}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Cho phép khán giả đặt câu hỏi
              </label>
            </div>
          </div>
        </div>

        {showInteractionList ? (
          <>
            {/* List Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-800">Câu hỏi & Bình chọn đã tạo</h3>
                <button
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors"
                >
                  <Sparkles size={14} />
                  AI gợi ý câu hỏi
                </button>
              </div>

              {showAiSuggestions && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
                    <Sparkles size={13} />
                    Gợi ý từ AI phù hợp với sự kiện của bạn
                  </div>

                  {settings.enableQA && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Câu hỏi Q&A gợi ý</h4>
                      <div className="space-y-2">
                        {aiSuggestions.questions.map((q, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-white">
                            <span className="text-xs text-slate-700 font-medium">{q}</span>
                            <button
                              onClick={() => addInteraction('question', q)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              Thêm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.enablePolls && (
                    <div className="space-y-2 pt-2 border-t border-slate-100/50">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bình chọn gợi ý</h4>
                      <div className="space-y-2">
                        {aiSuggestions.polls.map((p, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-white">
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-800 truncate">{p.text}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.options.join(' • ')}</p>
                            </div>
                            <button
                              onClick={() => addInteraction('poll', p.text, p.options)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                            >
                              Thêm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Added Items List */}
              <div className="space-y-3">
                {interactions.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        {item.type === 'question' ? <HelpCircle size={16} /> : <BarChart2 size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{item.text}</p>
                        {item.type === 'poll' && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.options.join(' • ')}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeInteraction(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Manual Section - Bỏ viền bên ngoài */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Thêm nội dung tương tác mới</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-6">
                  {settings.enableQA && (
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                      <input
                        type="radio"
                        checked={newType === 'question'}
                        onChange={() => setNewType('question')}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded-full focus:ring-indigo-500 cursor-pointer"
                      />
                      Câu hỏi văn bản
                    </label>
                  )}
                  {settings.enablePolls && (
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                      <input
                        type="radio"
                        checked={newType === 'poll'}
                        onChange={() => setNewType('poll')}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded-full focus:ring-indigo-500 cursor-pointer"
                      />
                      Cuộc bình chọn nhanh
                    </label>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Nhập câu hỏi hoặc câu hỏi biểu quyết..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                  />
                  
                  <button
                    onClick={handleAddManual}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shrink-0"
                  >
                    <Plus size={16} />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-400 font-medium">
              Hãy kích hoạt Q&A hoặc Bình chọn ở trên để thiết lập nội dung tương tác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
