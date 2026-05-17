import React from "react";
import { Upload } from "lucide-react";
import { Field, Input, Textarea } from "./BaseUI.jsx";
import ImageUpload from "../../../common/ImageUpload.jsx";

const InteractionAndSettingsSection = ({
  formData,
  setFormData,
  errors,
  term,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Mô tả & Cài đặt người tham gia
      </h2>

      <Field
        id="field-eventPurpose"
        label={`Mô tả ${term}`}
        required
        error={errors.eventPurpose}
      >
        <Textarea
          placeholder={`Mô tả chi tiết về ${term}, nội dung chính, đối tượng tham gia...`}
          rows={6}
          value={formData.eventPurpose || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventPurpose: e.target.value,
            })
          }
        />
      </Field>

      <Field
        id="field-maxParticipants"
        label="Số lượng người tham gia tối đa"
        required
        error={errors.maxParticipants}
      >
        <Input
          type="number"
          placeholder="VD: 500"
          value={formData.maxParticipants || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              maxParticipants: e.target.value,
            })
          }
        />
      </Field>

      <Field id="field-goal" label={`Mục tiêu ${term}`}>
        <Input
          placeholder="VD: Nâng cao kỹ năng, Kết nối doanh nghiệp..."
          value={formData.goal || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              goal: e.target.value,
            })
          }
        />
      </Field>

      <Field
        id="field-requirement"
        label="Yêu cầu đối với người tham gia"
      >
        <Textarea
          placeholder="VD: Sinh viên năm 3, 4; Có kiến thức cơ bản về lập trình..."
          value={formData.requirement || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              requirement: e.target.value,
            })
          }
        />
      </Field>

      <Field label={`Hình ảnh ${term}`}>
        <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <Upload size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">
                Tải ảnh lên
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG, JPG tối đa 5MB
              </p>
            </div>
          </div>

          <ImageUpload
            value={formData.coverImage}
            onChange={(url) =>
              setFormData({
                ...formData,
                coverImage: url,
              })
            }
          />
        </div>
      </Field>
    </div>
  );
};

export default InteractionAndSettingsSection;