import React from "react";
import { MapPin, Timer } from "lucide-react";
import {
  Field,
  Input,
  Select,
  DateTimeField,
} from "./BaseUI";
import { EVENT_TYPES } from "./GeneralInfoSection";

const BasicInfoSection = ({
  formData,
  setFormData,
  errors,
  term,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Thông tin cơ bản
      </h2>

      <Field
        id="field-eventTitle"
        label={`Tên ${term}`}
        required
        error={errors.eventTitle}
      >
        <Input
          placeholder="VD: Hội thảo Công nghệ AI 2026"
          value={formData.eventTitle || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventTitle: e.target.value,
            })
          }
        />
      </Field>

      <Field
        id="field-eventTopic"
        label="Chủ đề chuyên môn"
        required
        error={errors.eventTopic}
      >
        <Input
          placeholder="VD: Trí tuệ nhân tạo, Kỹ năng mềm..."
          value={formData.eventTopic || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventTopic: e.target.value,
            })
          }
        />
      </Field>

      <Field
        id="field-eventType"
        label={`Danh mục ${term}`}
        required
        error={errors.eventType}
      >
        <Select
          value={formData.eventType || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventType: e.target.value,
            })
          }
        >
          <option value="">-- Chọn danh mục --</option>
          {EVENT_TYPES.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Timer size={18} className="text-indigo-600" />
          {`Thời gian ${term}`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            id="field-startTime"
            label="Thời gian bắt đầu"
            required
            error={errors.startTime}
          >
            <DateTimeField
              value={formData.startTime}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  startTime: val,
                })
              }
            />
          </Field>

          <Field
            id="field-endTime"
            label="Thời gian kết thúc"
            required
            error={errors.endTime}
          >
            <DateTimeField
              value={formData.endTime}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  endTime: val,
                })
              }
            />
          </Field>
        </div>

        <Field
          id="field-registrationDeadline"
          label="Hạn đăng ký tham gia"
          required
          error={errors.registrationDeadline}
        >
          <DateTimeField
            value={formData.registrationDeadline}
            onChange={(val) =>
              setFormData({
                ...formData,
                registrationDeadline: val,
              })
            }
          />
        </Field>
      </div>

      <Field
        id="field-location"
        label="Địa điểm tổ chức"
        required
        error={errors.location}
      >
        <div className="relative">
          <Input
            placeholder="VD: Hội trường A, Cơ sở Nguyễn Văn Bảo"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: e.target.value,
              })
            }
          />

          <MapPin
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </Field>
    </div>
  );
};

export default BasicInfoSection;