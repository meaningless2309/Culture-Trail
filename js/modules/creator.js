/* Tiện ích nội dung dùng cho Nghệ nhân & Biên tập: chuyển đổi nội dung, kiểm tra điều kiện gửi duyệt, xem trước */
(function () {
  const CT = (window.CT = window.CT || {});
  const esc = CT.esc;
  CT.su = {
    MIN_WORDS: 300,
    toText(sections) {
      if (!sections || !sections.length) return "";
      if (sections.length === 1 && sections[0].h === "Nội dung")
        return sections[0].p.join("\n\n");
      return sections
        .map((x) => `## ${x.h}\n\n${x.p.join("\n\n")}`)
        .join("\n\n");
    },
    fromText(t) {
      const secs = [];
      let cur = null,
        buf = [];
      const flush = () => {
        const paras = buf
          .join("\n")
          .split(/\n{2,}/)
          .map((x) => x.trim())
          .filter(Boolean);
        if (!cur && !paras.length) {
          buf = [];
          return;
        }
        if (!cur) cur = { h: "Nội dung", p: [] };
        cur.p = paras;
        secs.push(cur);
        cur = null;
        buf = [];
      };
      String(t || "")
        .replace(/\r/g, "")
        .split("\n")
        .forEach((l) => {
          const m = l.match(/^##\s+(.*)$/);
          if (m) {
            flush();
            cur = { h: m[1].trim() || "Mục", p: [] };
          } else buf.push(l);
        });
      flush();
      return secs;
    },
    /* danh sách điều kiện gửi duyệt */
    check(s) {
      const w = CT.storyWords(s);
      return [
        {
          key: "title",
          ok: !!(s.title || "").trim() && s.title.length <= 100,
          label: "Tiêu đề rõ ràng",
          bad: !(s.title || "").trim()
            ? "Thiếu tiêu đề"
            : "Tiêu đề tối đa 100 ký tự",
        },
        {
          key: "place",
          ok: !!s.placeId,
          label: "Có địa danh liên kết",
          bad: "Chọn địa danh liên kết",
        },
        {
          key: "words",
          ok: w >= CT.su.MIN_WORDS,
          label: "Nội dung trên 300 từ",
          bad: `Nội dung cần trên 300 từ (hiện ${w} từ)`,
        },
        {
          key: "img",
          ok: !!(s.imageSource || "").trim(),
          label: "Có nguồn ảnh / quyền sử dụng",
          bad: "Bổ sung nguồn ảnh",
        },
      ];
    },
    preview(s) {
      return CT.ui.dialog({
        title: "Xem trước: " + (s.title || "(chưa có tiêu đề)"),
        wide: true,
        html: `<p class="muted">${esc(s.lead || "")}</p><div class="u-12">${(s.sections || []).map((x) => `<h3 class="u-13">${esc(x.h)}</h3>${x.p.map((t) => `<p>${esc(t)}</p>`).join("")}`).join("") || '<p class="muted">Chưa có nội dung.</p>'}</div><p class="small muted">Đây là bản xem trước, chưa công khai.</p>`,
      });
    },
  };

  CT.eu = {
    /* trả về {tênTrường: thông báo lỗi} */
    check(e) {
      const err = {},
        miss = "Trường này là bắt buộc.";
      if (!(e.title || "").trim()) err.title = "Nhập tên sự kiện.";
      if (!e.placeId) err.placeId = "Chọn địa danh liên kết.";
      if (!(e.location || "").trim()) err.location = "Nhập địa điểm tổ chức.";
      if (!e.startDate) err.startDate = "Chọn ngày bắt đầu.";
      if (!e.endDate) err.endDate = "Chọn ngày kết thúc.";
      if (!e.startTime) err.startTime = "Chọn giờ bắt đầu.";
      if (!e.endTime) err.endTime = "Chọn giờ kết thúc.";
      if (e.startDate && e.endDate && e.endDate < e.startDate)
        err.endDate = "Ngày kết thúc phải từ ngày bắt đầu trở đi.";
      else if (
        e.startDate &&
        e.endDate &&
        e.startDate === e.endDate &&
        e.startTime &&
        e.endTime &&
        e.endTime <= e.startTime
      )
        err.endTime = `Giờ kết thúc phải sau ${e.startTime} trong cùng ngày.`;
      const cap = Number(e.capacity);
      if (!Number.isInteger(cap) || cap < 1)
        err.capacity = "Sức chứa phải là số nguyên dương.";
      else if (cap < (e.registered || 0))
        err.capacity = `Sức chứa không được nhỏ hơn số người đã đăng ký (${e.registered}).`;
      if (!(e.desc || "").trim()) err.desc = "Nhập mô tả sự kiện.";
      if (!(e.contact || "").trim()) err.contact = "Nhập thông tin liên hệ.";
      return err;
    },
    /* hủy sự kiện: bắt buộc lý do, thông báo cho người đã lưu */
    async cancel(ev) {
      const r = await CT.ui.confirm({
        title: "Hủy sự kiện?",
        text: "Người đã lưu sự kiện sẽ thấy thông báo hủy. Cần ghi lý do; bản ghi vẫn được giữ trong danh sách.",
        confirm: "Hủy & thông báo",
        danger: true,
        reason: {
          label: "Lý do hủy",
          required: true,
          placeholder: "Ví dụ: Xưởng bảo trì khu vực lò nung.",
        },
      });
      if (!r) return false;
      await CT.api.run(() => {
        CT.db.update("events", ev.id, {
          status: "cancelled",
          cancelReason: r.reason,
          updatedAt: new Date().toISOString(),
        });
        CT.db
          .all("users")
          .filter((u) => (u.savedEvents || []).includes(ev.id))
          .forEach((u) =>
            CT.notify(u.id, {
              type: "event",
              title: `Sự kiện “${ev.title}” đã bị hủy`,
              body: "Lý do: " + r.reason,
              link: "explorer-place-detail.html?id=" + ev.placeId + "#events",
              linkLabel: "Xem địa danh",
            }),
          );
      });
      CT.ui.toast("Đã hủy sự kiện và thông báo cho người đã lưu.");
      return true;
    },
    notifyChange(ev, what) {
      CT.db
        .all("users")
        .filter((u) => (u.savedEvents || []).includes(ev.id))
        .forEach((u) =>
          CT.notify(u.id, {
            type: "event",
            title: `Lịch “${ev.title}” có thay đổi`,
            body: what,
            link: "explorer-place-detail.html?id=" + ev.placeId + "#events",
            linkLabel: "Xem sự kiện",
          }),
        );
    },
  };
})();
