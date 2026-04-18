import { formatDateTimeForWord } from './dateTimeFormatter';

const formatDateTime = formatDateTimeForWord;

const getComplexItemTitle = (fieldDef, totalItems, index) => {
  const baseLabel = (fieldDef?.label || 'Mục').trim() || 'Mục';
  if (totalItems <= 1) return '';
  const title = `${baseLabel} ${index + 1}`;
  return title.endsWith(':') ? title : `${title}:`;
};

const renderCustomFieldValue = (field, fieldDef) => {
  const value = field.value;
  if (value === null || value === undefined || value === '') {
    return '<span style="color: #999; font-style: italic;">Chưa có dữ liệu</span>';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '<span style="color: #999; font-style: italic;">Danh sách rỗng</span>';
    }
    const firstItem = value[0];
    const isComplexList = firstItem !== null && typeof firstItem === 'object' && !Array.isArray(firstItem) && Object.keys(firstItem).length > 0;
    if (isComplexList) {
      const subFieldsMap = new Map(fieldDef?.subFields?.map(sf => [sf.key, { label: sf.label, type: sf.type }]) || []);
      return value.map((item, idx) => {
        const itemTitle = getComplexItemTitle(fieldDef, value.length, idx);
        return `
          <div style="margin-bottom: 12px;">
            ${itemTitle ? `<div style="font-weight: bold; margin-bottom: 6px;">${itemTitle}</div>` : ''}
            ${Object.entries(item).map(([subKey, subValue]) => {
              const subFieldInfo = subFieldsMap.get(subKey) || {
                label: subKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim(),
                type: 'TEXT'
              };
              const formattedValue = formatFieldValueForWordWithStyling(subValue, subFieldInfo.type);
              return `<div style="margin-left: 20px; margin-bottom: 4px; white-space: nowrap;">${subFieldInfo.label}: ${formattedValue}</div>`;
            }).join('')}
          </div>
        `;
      }).join('');
    }
    return `
      <ul style="margin: 0; padding-left: 30px;">
        ${value.map(item => `<li style="margin-bottom: 6px;">${formatFieldValueForWordWithStyling(item, 'TEXT')}</li>`).join('')}
      </ul>
    `;
  }
  if (typeof value === 'object') {
    return `<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 11pt;">${JSON.stringify(value, null, 2)}</pre>`;
  }
  const fieldType = fieldDef?.type || 'TEXT';
  return formatFieldValueForWordWithStyling(value, fieldType);
};

const formatFieldValueForWordWithStyling = (value, fieldType) => {
  if (value === null || value === undefined || value === '') {
    return '<span style="color: #999; font-style: italic;">Chưa có dữ liệu</span>';
  }
  const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
  switch (fieldType) {
    case 'URL':
      return `<span style="color: #0066cc; font-style: italic;">${String(value)}</span>`;
    case 'EMAIL':
      return String(value);
    case 'DATETIME':
      return formatDateTime(value);
    case 'NUMBER':
      return typeof value === 'number' ? value.toString() : String(value);
    default:
      if (isUrl) {
        return `<span style="color: #0066cc; font-style: italic;">${String(value)}</span>`;
      }
      return String(value);
  }
};

export const generateWordPreview = (eventData, templateFields = []) => {
  const today = new Date();
  const formattedDate = `Thành phố Hồ Chí Minh, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  const title = eventData.extractedTitle || eventData.title || 'Sự kiện';
  const subject = eventData.extractedSubject || eventData.subject || '';
  const purpose = eventData.extractedPurpose || eventData.purpose || '';
  const targetAudience = eventData.extractedTargetAudience || eventData.targetAudience || '';
  const trimmedTargetAudience = targetAudience.trim();
  const programItems = eventData.programItems || [];
  const teamMembers = eventData.teamMembers || [];
  const attendees = eventData.attendees || [];
  const recipients = eventData.recipients || [];
  const hasMaxParticipants = eventData.maxParticipants !== null && eventData.maxParticipants !== undefined;
  const hasOrganizationUnit = typeof eventData.organizationUnit === 'string' && eventData.organizationUnit.trim().length > 0;

  let sectionCounter = 2;
  const targetAudienceSectionNumber = trimmedTargetAudience ? ++sectionCounter : null;
  const maxParticipantsSectionNumber = hasMaxParticipants ? ++sectionCounter : null;
  const organizingUnitSectionNumber = hasOrganizationUnit ? ++sectionCounter : null;
  let sectionNumber = sectionCounter + 1;

  return `
    <div style="font-family: 'Times New Roman', serif; line-height: 1.8; font-size: 13pt; max-width: 850px; margin: 0 auto; padding: 30px; background: white;">
      <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
        <tr>
          <td style="width: 52%; text-align: center; vertical-align: top; padding: 8px; border: none;">
            <div style="font-weight: bold; font-size: 12pt; line-height: 1.35; text-transform: uppercase; white-space: nowrap; display: block;">
              ${eventData.university || 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM'}
            </div>
            <div style="font-weight: bold; font-size: 11pt; line-height: 1.35; text-transform: uppercase; white-space: nowrap; display: block;">
              ${eventData.faculty || 'KHOA CÔNG NGHỆ THÔNG TIN'}
            </div>
            ${eventData.department ? `
            <div style="font-weight: bold; font-size: 11pt; line-height: 1.35; text-transform: uppercase; white-space: nowrap; display: block; margin-top: 4px;">
              ${(eventData.department || '').toUpperCase()}
            </div>
            ` : ''}
            <div style="border-bottom: 1.5px solid #000; width: 140px; margin: 12px auto 0;"></div>
          </td>
          <td style="width: 48%; text-align: center; vertical-align: top; padding: 8px; border: none;">
            <div style="font-weight: bold; font-size: 12pt; line-height: 1.35; text-transform: uppercase; white-space: nowrap; display: block;">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div style="font-weight: bold; font-size: 12pt; line-height: 1.35;">
              <em>Độc lập - Tự do - Hạnh phúc</em>
            </div>
            <div style="border-bottom: 1.5px solid #000; width: 100px; margin: 12px auto;"></div>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 25px 0;">
        <h3 style="margin: 8px 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">KẾ HOẠCH</h3>
        <div style="font-weight: bold; font-size: 13pt; margin: 8px 0;">V/v: ${title}</div>
        ${subject ? `<div style="font-style: italic; font-size: 13pt; margin: 8px 0;">${subject}</div>` : ''}
      </div>

      <div style="text-align: justify; margin-top: 30px;">
        ${purpose ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">1. Mục đích</p>
          <p style="margin: 8px 0; text-indent: 30px; line-height: 1.8;">- ${purpose}</p>
        </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">2. Thời gian và địa điểm</p>
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Thời gian bắt đầu: <strong>${formatDateTime(eventData.eventStartDateTime)}</strong>
          </p>
          ${eventData.eventEndDateTime ? `
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Thời gian kết thúc: <strong>${formatDateTime(eventData.eventEndDateTime)}</strong>
          </p>
          ` : ''}
          ${eventData.registrationDeadline ? `
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Hạn chót đăng ký: <strong>${formatDateTime(eventData.registrationDeadline)}</strong>
          </p>
          ` : ''}
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Địa điểm: <strong>${eventData.location || 'Chưa xác định'}</strong>
          </p>
          ${(eventData.eventMode === 'ONLINE' || eventData.eventMode === 'HYBRID') && eventData.zoomLink ? `
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Link tham gia: <a href="${eventData.zoomLink}" style="color: #0066cc;">${eventData.zoomLink}</a>
          </p>
          ` : ''}
        </div>

        ${trimmedTargetAudience ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${targetAudienceSectionNumber}. Đối tượng tham gia</p>
          <p style="margin: 8px 0; text-indent: 30px; line-height: 1.8;">- ${trimmedTargetAudience}</p>
        </div>
        ` : ''}
        ${hasMaxParticipants ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${maxParticipantsSectionNumber}. Số lượng tham gia</p>
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> Tối đa: <span>${eventData.maxParticipants} người tham gia</span>
          </p>
        </div>
        ` : ''}
        ${hasOrganizationUnit ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${organizingUnitSectionNumber}. Đơn vị tổ chức</p>
          <p style="margin: 8px 0; text-indent: 30px;">
            <strong>-</strong> ${eventData.organizationUnit}
          </p>
        </div>
        ` : ''}

        ${programItems.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${sectionNumber++}. Nội dung chương trình</p>
          ${programItems
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((item, index) => {
              const presenterInfo = [];
              if (item.presenter) presenterInfo.push(item.presenter);
              if (item.presenterTitle) presenterInfo.push(item.presenterTitle);
              if (item.presenterUnit) presenterInfo.push(`${item.presenterUnit}`);
              return `
                <div style="margin: 8px 0; text-indent: 30px;">
                  <p style="margin: 5px 0;"><strong>Phần ${index + 1}. ${item.title || 'Chương trình'}</strong></p>
                  ${presenterInfo.length > 0 ? `<p style="margin: 5px 0; text-indent: 60px;">- Người chia sẻ: ${presenterInfo.join(' - ')}</p>` : ''}
                  ${item.description ? `<p style="margin: 5px 0; text-indent: 60px; font-style: italic;">Nội dung: ${item.description}</p>` : ''}
                </div>
              `;
            }).join('')}
        </div>
        ` : ''}

        ${(() => {
          let customFieldsToRender = [];
          if (eventData.templateData?.customFields && Array.isArray(eventData.templateData.customFields)) {
            customFieldsToRender = eventData.templateData.customFields
              .filter(f => f.value && !(Array.isArray(f.value) && f.value.length === 0))
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          } else if (templateFields && templateFields.length > 0) {
            const systemFields = ['eventStartDateTime','eventEndDateTime','location','organizationUnit','department','eventMode','zoomLink','additionalNotes','recipients','programItems','teamMembers','attendees','extractedTitle','extractedSubject','extractedPurpose','extractedTargetAudience','registrationDeadline','maxParticipants'];
            customFieldsToRender = templateFields
              .filter(field => !systemFields.includes(field.key))
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map(field => ({
                key: field.key,
                label: field.label,
                value: eventData.templateData?.[field.key] || eventData[field.key],
                subFields: field.subFields,
                type: field.type
              }))
              .filter(field => field.value && !(Array.isArray(field.value) && field.value.length === 0));
          }
          return customFieldsToRender.map(field => {
            let fieldDef = field.subFields ? field : templateFields.find(f => f.key === field.key);
            const fieldDefinition = fieldDef ? { ...fieldDef, subFields: fieldDef.subFields || field.subFields } : undefined;
            const renderedValue = renderCustomFieldValue({ value: field.value }, fieldDefinition);
            const needsDash = !renderedValue.includes('<div') && !renderedValue.includes('<ul') && !renderedValue.includes('<span');
            return `
              <div style="margin-bottom: 20px;">
                <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${sectionNumber++}. ${field.label}</p>
                <div style="margin-left: 30px; text-align: justify;">
                  ${needsDash ? '- ' : ''}${renderedValue}
                </div>
              </div>
            `;
          }).join('');
        })()}

        ${teamMembers.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${sectionNumber++}. Ban tổ chức</p>
          ${teamMembers
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map(member => {
              const memberInfo = [];
              if (member.name) memberInfo.push(member.name);
              if (member.position) memberInfo.push(member.position);
              if (member.role) memberInfo.push(member.role);
              if (member.unit) memberInfo.push(`${member.unit}`);
              return `<p style="margin: 5px 0; text-indent: 30px;"><strong>-</strong> ${memberInfo.join(' - ') || 'Thành viên BTC'}</p>`;
            }).join('')}
        </div>
        ` : ''}

        ${attendees.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${sectionNumber++}. Danh sách tham dự</p>
          ${attendees
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map(attendee => {
              const attendeeInfo = [];
              if (attendee.name) attendeeInfo.push(attendee.name);
              if (attendee.position) attendeeInfo.push(attendee.position);
              if (attendee.department) attendeeInfo.push(attendee.department);
              if (attendee.role) attendeeInfo.push(attendee.role);
              return `<p style="margin: 5px 0; text-indent: 30px;"><strong>-</strong> ${attendeeInfo.join(' - ') || 'Người tham dự'}</p>`;
            }).join('')}
        </div>
        ` : ''}

        ${eventData.additionalNotes ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">${sectionNumber++}. Ghi chú thêm</p>
          <p style="margin: 8px 0; text-indent: 30px; line-height: 1.8;">${eventData.additionalNotes}</p>
        </div>
        ` : ''}
      </div>

      ${recipients.length > 0 ? `
      <div style="margin-top: 35px; margin-bottom: 25px;">
        <p style="margin: 10px 0; font-weight: bold; text-indent: 0;">Nơi nhận:</p>
        ${recipients.map(recipient => `
          <p style="margin: 5px 0; text-indent: 30px;"><strong>-</strong> ${recipient};</p>
        `).join('')}
      </div>
      ` : ''}

      <div style="font-style: italic; font-size: 13pt; margin-top: 35px; margin-bottom: 20px; color: #555; text-align: right;">
        ${formattedDate}
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top; padding: 20px; border: none;">
            <div style="font-weight: bold; margin-bottom: 100px; font-size: 12.5pt;">
              Khoa ${eventData.faculty || 'Đơn vị tổ chức'} duyệt
            </div>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top; padding: 20px; border: none;">
            <div style="font-weight: bold; margin-bottom: 12px; font-size: 13pt;">
              Người lập kế hoạch
            </div>
            <div style="font-style: italic; font-size: 11pt; margin-bottom: 70px; color: #555;">
              (Ký và ghi rõ họ tên)
            </div>
            ${eventData.createdByName ? `
              <div style="font-weight: bold; font-size: 13pt;">
                ${eventData.createdByName}
              </div>
            ` : ''}
          </td>
        </tr>
      </table>
    </div>
  `;
};