/* CultureTrail — lớp dữ liệu giả lập (LocalStorage) + phiên đăng nhập.
   Đây là Frontend nguyên mẫu: mọi "API" đều chạy cục bộ, có độ trễ và có thể giả lập lỗi (chân trang → Chế độ demo). */
(function () {
  const CT = (window.CT = window.CT || {});
  const V = "ct2";
  const key = (n) => `${V}_${n}`;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  CT.uid = (p) => (p || "x") + Math.random().toString(36).slice(2, 8);
  CT.param = (n) => new URLSearchParams(location.search).get(n);

  CT.sim = {
    get: () => localStorage.getItem("ct_sim") || "",
    set(v) {
      v ? localStorage.setItem("ct_sim", v) : localStorage.removeItem("ct_sim");
    },
  };

  CT.db = {
    all(n) {
      const raw = localStorage.getItem(key(n));
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {}
      }
      const d = clone(CT.seed[n] || []);
      localStorage.setItem(key(n), JSON.stringify(d));
      return d;
    },
    save(n, d) {
      localStorage.setItem(key(n), JSON.stringify(d));
    },
    get(n, id) {
      return this.all(n).find((x) => x.id === id) || null;
    },
    insert(n, item) {
      const d = this.all(n);
      item.id = item.id || CT.uid(n[0]);
      d.push(item);
      this.save(n, d);
      return item;
    },
    update(n, id, patch) {
      const d = this.all(n);
      const i = d.findIndex((x) => x.id === id);
      if (i < 0) return null;
      if (typeof patch === "function") {
        patch(d[i]);
      } else Object.assign(d[i], patch);
      this.save(n, d);
      return d[i];
    },
    remove(n, id) {
      this.save(
        n,
        this.all(n).filter((x) => x.id !== id),
      );
    },
    reset() {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("ct"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem("ct_s");
    },
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  /* Chạy một thao tác "máy chủ" giả lập: có trễ, có thể lỗi (sim=error) hoặc chậm (sim=slow). */
  CT.api = {
    async run(fn, opt) {
      const ms = (opt && opt.ms) || 350,
        s = CT.sim.get();
      await wait(s === "slow" ? 2600 : ms);
      if (s === "error") throw new Error("Lỗi kết nối");
      return fn();
    },
    list(n, filter) {
      return this.run(() => CT.db.all(n).filter(filter || (() => true)));
    },
    get(n, id) {
      return this.run(() => CT.db.get(n, id));
    },
  };

  /* ---------- Phiên & vai trò ---------- */
  CT.ROLE_LABEL = {
    explorer: "Người khám phá",
    creator: "Nghệ nhân",
    curator: "Biên tập",
    admin: "Quản trị",
  };
  CT.ROLE_FULL = {
    explorer: "Người khám phá",
    creator: "Nghệ nhân / Nhà sáng tạo",
    curator: "Biên tập văn hóa",
    admin: "Quản trị viên",
  };
  CT.ROLE_HOME = {
    explorer: "explorer-story-discovery.html",
    creator: "creator-profile.html",
    curator: "curator-content-review.html",
    admin: "admin-tag-management.html",
  };
  CT.auth = {
    session() {
      try {
        return JSON.parse(
          sessionStorage.getItem("ct_s") ||
            localStorage.getItem("ct_s") ||
            "null",
        );
      } catch (e) {
        return null;
      }
    },
    user() {
      const s = this.session();
      return s ? CT.db.get("users", s.userId) : null;
    },
    role() {
      const s = this.session();
      return s ? s.role : null;
    },
    login(user, remember, role) {
      const s = JSON.stringify({ userId: user.id, role: role || "explorer" });
      sessionStorage.removeItem("ct_s");
      localStorage.removeItem("ct_s");
      (remember ? localStorage : sessionStorage).setItem("ct_s", s);
    },
    setRole(role) {
      const s = this.session();
      if (!s) return;
      s.role = role;
      (localStorage.getItem("ct_s") ? localStorage : sessionStorage).setItem(
        "ct_s",
        JSON.stringify(s),
      );
    },
    logout() {
      sessionStorage.removeItem("ct_s");
      localStorage.removeItem("ct_s");
    },
    roles(u) {
      return ["explorer"].concat((u && u.roles) || []);
    },
    has(u, role) {
      return !!u && (role === "explorer" || (u.roles || []).includes(role));
    },
  };

  /* ---------- Tra cứu & tiện ích dữ liệu ---------- */
  CT.place = (id) => CT.db.get("places", id);
  CT.user = (id) => CT.db.get("users", id);
  CT.tag = (id) => CT.db.get("tags", id);
  CT.creator = (id) => CT.db.get("creators", id);
  CT.story = (id) => CT.db.get("stories", id);
  /* Bản công khai của bài: nếu đang sửa phiên bản mới thì người đọc vẫn thấy liveSnapshot */
  CT.pub = (s) =>
    s && s.liveSnapshot ? Object.assign({}, s, s.liveSnapshot) : s;
  CT.words = (t) =>
    (
      String(t || "")
        .trim()
        .match(/\S+/g) || []
    ).length;
  CT.storyText = (s) => (s.sections || []).map((x) => x.p.join(" ")).join(" ");
  CT.storyWords = (s) => CT.words(CT.storyText(s));
  CT.notify = (userId, n) =>
    CT.db.insert(
      "notifications",
      Object.assign(
        {
          userId,
          type: "system",
          title: "",
          body: "",
          link: "",
          linkLabel: "",
          read: false,
          hidden: false,
          at: new Date().toISOString(),
        },
        n,
      ),
    );
  CT.unread = (uid) =>
    CT.db
      .all("notifications")
      .filter((n) => n.userId === uid && !n.read && !n.hidden).length;
  CT.storyPlaceName = (s) =>
    s.placeId ? (CT.place(s.placeId) || {}).name : s.placeHint || "—";

  CT.TOPICS = {
    craft: "Nghề thủ công",
    heritage: "Di sản & kiến trúc",
    food: "Ẩm thực",
    festival: "Lễ hội",
  };
  CT.REGIONS = ["Miền Bắc", "Miền Trung", "Miền Nam"];
  CT.fmt = {
    date(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      return isNaN(d)
        ? iso
        : d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    },
    ymd(s) {
      if (!s) return "—";
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    },
    dt(iso) {
      const d = new Date(iso);
      return isNaN(d)
        ? ""
        : d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) +
            " " +
            d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
    },
    short(iso) {
      const d = new Date(iso);
      return isNaN(d)
        ? ""
        : String(d.getDate()).padStart(2, "0") +
            "/" +
            String(d.getMonth() + 1).padStart(2, "0") +
            " · " +
            d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
    },
    ago(iso) {
      const m = Math.round((Date.now() - new Date(iso)) / 60000);
      if (m < 1) return "Vừa xong";
      if (m < 60) return m + " phút trước";
      const h = Math.round(m / 60);
      if (h < 24) return h + " giờ trước";
      const d = Math.round(h / 24);
      if (d === 1) return "Hôm qua";
      return CT.fmt.date(iso);
    },
    num: (n) => Number(n).toLocaleString("vi-VN"),
  };
})();
