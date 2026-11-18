(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  // Desk-clock hours (from Friday 00:00) so the register can tell what is late.
  const hours = { "Fri 8 pm": 20, "Sat 9 am": 33, "Sat 10 am": 34, "Sat noon": 36 };
  const dueTimes = Object.keys(hours);
  const shifts = [
    {
      hour: 15.75,
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      hour: 19.5,
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      hour: 33,
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    checkin: "",
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  // The last check-in, kept only for this visit so a mis-ticked box can be put right.
  let undo = null;
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const now = () => shifts[s.phase].hour;
  const late = (l) => !l.back && now() > hours[l.due];
  const unitName = (a) => a.id + " · " + a.type;
  const opts = (list, sel) =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === sel ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, kind = "") =>
    '<span class="tag' + (kind ? " " + kind : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf" ? "good" : ""),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit · grouped by request",
      s.editing || s.checkin
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    if (s.loans.some((l) => l.req === s.checkin && !l.back))
      return html + checkinForm(getReq(s.checkin));
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    // Newest first, one block per request so a kit reads as a kit.
    const shown = s.loans.filter((l) => !s.onlyOpen || !l.back).reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const id of new Set(shown.map((l) => l.req)))
      html += kit(
        getReq(id),
        shown.filter((l) => l.req === id),
      );
    return html;
  }
  function kit(r, slips) {
    const all = s.loans.filter((l) => l.req === r.id);
    const open = all.filter((l) => !l.back).length;
    const status = open
      ? open + " of " + all.length + " unit" + (all.length > 1 ? "s" : "") + " still out"
      : "All units returned";
    return (
      '<section class="kit" aria-label="' +
      esc(r.id + " · " + r.club) +
      '"><div class="kithead"><div><strong>' +
      esc(r.id + " · " + r.club) +
      "</strong><small>" +
      esc(r.event + " · " + status) +
      "</small></div>" +
      (open ? btn("Check in", "checkin", r.id, "primary") : "") +
      "</div>" +
      slips.map(slip).join("") +
      "</section>"
    );
  }
  function slip(l) {
    const a = getAsset(l.asset);
    const f = l.followUp;
    const state = l.back
      ? badge("Returned" + (shifts[l.backAt] ? " · " + shifts[l.backAt].time : ""))
      : late(l)
        ? badge("Overdue", "late")
        : badge("Out");
    return (
      '<div class="row"><div><strong>' +
      esc(unitName(a)) +
      "</strong><small>" +
      esc("L-" + l.num + " · " + a.model + " · Collected by " + l.who + " · Due " + l.due) +
      "</small>" +
      (f && !l.back
        ? '<p class="followup">' +
          esc("With " + f.who + " · expected " + f.by) +
          "<small>" +
          esc("Noted " + shifts[f.at].time) +
          "</small></p>"
        : "") +
      "</div><div>" +
      state +
      "</div></div>"
    );
  }
  function checkinForm(r) {
    const open = s.loans.filter((l) => l.req === r.id && !l.back);
    const times = dueTimes.filter((t) => hours[t] >= now());
    const pick = (label, name, list, sel) =>
      "<label><span>" +
      label +
      '</span><select name="' +
      name +
      '"><option value="">Select…</option>' +
      opts(list.map((v) => [v, v]), sel) +
      "</select></label>";
    return (
      '<form data-checkin><div class="record"><small>Check in · ' +
      esc(r.id) +
      "</small><h3>" +
      esc(r.club + " · " + r.event) +
      "</h3><p>Tick each unit that is at the counter. Read the tag on the unit itself: look-alike units share a bin.</p></div>" +
      open
        .map((l) => {
          const a = getAsset(l.asset);
          const f = l.followUp || {};
          return (
            '<div class="unit" role="group" aria-label="' +
            esc(unitName(a)) +
            '"><label class="check"><input type="checkbox" name="back" value="' +
            l.num +
            '" /><span><strong>' +
            esc(unitName(a)) +
            "</strong><small>" +
            esc(a.model + " · Tag " + a.id + " · Slip L-" + l.num + " · Due " + l.due) +
            '</small></span></label><div class="form stillout">' +
            pick("Not here: who has it?", "who-" + l.num, people, f.who) +
            pick("Expected back by", "by-" + l.num, times, f.by) +
            "</div></div>"
          );
        })
        .join("") +
      '<p class="error" role="alert" data-error hidden></p><button type="submit" class="primary">Save check-in</button></form>'
    );
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        n.author || "Counter handover",
        n.text,
      ]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    q('[data-action="undo"]').hidden = !undo;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        undo = null;
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        undo = null;
        break;
      case "undo": {
        if (!undo) return;
        for (const saved of undo.loans)
          Object.assign(
            s.loans.find((l) => l.num === saved.num),
            saved,
          );
        for (const l of s.loans) {
          if (l.followUp === undefined) delete l.followUp;
          if (l.backAt === undefined) delete l.backAt;
        }
        s.notes.splice(undo.note, 1);
        s.tab = "Loan register";
        s.editing = false;
        s.checkin = undo.req;
        s.notice = "Check-in undone. Tick the units at the counter and save again.";
        undo = null;
        break;
      }
      case "tab":
        s.tab = v;
        s.editing = false;
        s.checkin = "";
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.checkin = "";
        break;
      case "cancel":
        s.editing = false;
        s.checkin = "";
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "checkin":
        if (!getReq(v)) return;
        s.checkin = v;
        s.editing = false;
        break;
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      undo = null;
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-checkin]")) {
      checkIn(f, form);
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    undo = null;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  // A partial return is only complete once every missing unit has a named
  // holder and a time. That is what the next shift needs to finish the job.
  function checkIn(f, form) {
    const r = getReq(s.checkin);
    const open = s.loans.filter((l) => l.req === r.id && !l.back);
    const back = new Set(form.getAll("back").map(Number));
    const field = (l, k) => String(form.get(k + "-" + l.num) || "");
    const missing = open.filter(
      (l) =>
        !back.has(l.num) &&
        !(people.includes(field(l, "who")) && hours[field(l, "by")] >= now()),
    );
    if (missing.length) {
      const msg =
        "For " +
        missing.map((l) => l.asset).join(", ") +
        ", tick it as returned or say who has it and when it is coming back.";
      const err = f.querySelector("[data-error]");
      err.textContent = msg;
      err.hidden = false;
      q("[data-status]").textContent = msg;
      return;
    }
    undo = {
      req: r.id,
      note: s.notes.length,
      loans: open.map((l) => ({
        num: l.num,
        back: l.back,
        backAt: l.backAt,
        followUp: l.followUp && { ...l.followUp },
      })),
    };
    const returned = [];
    const still = [];
    for (const l of open) {
      if (back.has(l.num)) {
        l.back = true;
        l.backAt = s.phase;
        delete l.followUp;
        returned.push(l);
      } else {
        l.followUp = { who: field(l, "who"), by: field(l, "by"), at: s.phase };
        still.push(l);
      }
    }
    const name = (l) => unitName(getAsset(l.asset));
    const lines = [];
    if (returned.length)
      lines.push("Returned: " + returned.map(name).join(", ") + ".");
    if (still.length)
      lines.push(
        "Still out: " +
          still
            .map(
              (l) =>
                name(l) +
                ", with " +
                l.followUp.who +
                ", expected " +
                l.followUp.by,
            )
            .join("; ") +
          ".",
      );
    else lines.push("Kit complete.");
    s.notes.push({
      phase: s.phase,
      author: "Check-in · " + r.id + " " + r.club,
      text: lines.join(" "),
    });
    s.checkin = "";
    commit(
      still.length
        ? "Checked in " + r.id + ". " + lines.slice(-1)[0]
        : r.id + " complete. All units back on the shelf.",
    );
  }
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      (d.checkin && !getReq(d.checkin)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) =>
          n &&
          shifts[n.phase] &&
          typeof n.text === "string" &&
          (n.author === undefined || typeof n.author === "string"),
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          Object.hasOwn(hours, l.due) &&
          (!l.followUp ||
            (people.includes(l.followUp.who) &&
              Object.hasOwn(hours, l.followUp.by) &&
              shifts[l.followUp.at])),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
