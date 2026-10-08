/* Ganga Garage — garage owner app prototype.
   Plain JS, no build step. State lives in `S`; every action mutates S and calls render(). */
var S;
var $ = function (id) { return document.getElementById(id); };
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dfmt(iso) { var p = iso.split('-'); return +p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
function daysSince(iso) { return Math.round((new Date(TODAY) - new Date(iso)) / 864e5); }
function addMonths(iso, m) { var d = new Date(iso); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); }
function nowStr() { var h = Math.floor(S.min / 60), m = S.min % 60; return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + (h >= 12 ? ' pm' : ' am'); }
function tick() { S.min += 2; return nowStr(); }
function initials(n) { return n.replace(/^Dr\.? /, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
function first(n) { return n.replace(/^Dr\.? /, 'Dr ').split(' ')[0] === 'Dr' ? n : n.split(' ')[0]; }

/* ---------- model helpers ---------- */
function item(name, price, kind, src, part) { return { id: 'i' + Math.random().toString(36).slice(2, 8), name: name, price: price, kind: kind, src: src, part: part || null, appr: 'none', reason: null, deducted: false, at: null }; }
function mkJob(plate, via) { return { id: 'J' + (S.seq++), plate: plate, status: 'draft', via: via, said: null, items: [], services: [], mech: null, eta: null }; }
function addSvc(j, k, src) { if (j.services.indexOf(k) > -1) return; j.services.push(k); SERV[k].lines.forEach(function (l) { var it = item(l[0], l[1], l[2], src, l[3]); it.svc = k; j.items.push(it); }); }
function smallCount(j) { return j.services.reduce(function (a, k) { return a + SERV[k].small; }, 0); }
function consumables(j) { var c = smallCount(j); return c ? Math.max(20, c * 4) : 0; }
function counted(it) { return it.appr === 'none' || it.appr === 'yes'; }
function total(j) { return j.items.filter(counted).reduce(function (a, i) { return a + i.price; }, 0) + consumables(j); }
function job(id) { return S.jobs.find(function (j) { return j.id === id; }); }
function veh(p) { return S.vehicles[p]; }
function custOf(j) { return S.customers[veh(j.plate).cust]; }
function activeJob(plate) { return S.jobs.find(function (j) { return j.plate === plate && j.status !== 'closed'; }); }
function svcNames(j) { return j.services.map(function (k) { return SERV[k].name; }).join(', '); }
function send(cid, text) { S.sent.unshift({ to: cid, t: tick(), text: text }); }
function snack(t) { S.snack = t; clearTimeout(snack.tm); snack.tm = setTimeout(function () { S.snack = null; render(); }, 4500); }
function mark(k) { S.progress[k] = true; }
function deduct(it, plate) {
  if (it.deducted || !it.part || !S.stock[it.part]) return;
  var s = S.stock[it.part]; s.qty = Math.max(0, s.qty - 1); S.month.parts += s.cost; it.deducted = true;
  S.usage.unshift({ t: nowStr(), what: s.name, qty: '−1', plate: plate });
}
function lastVisit(p) { var h = veh(p).history; return h.length ? h[0] : null; }
function isDue(p) { var l = lastVisit(p); return l ? daysSince(l.date) > 90 : false; }
function alertsCount() { return Object.values(S.stock).filter(function (s) { return s.qty <= s.re; }).length + Object.values(S.boxes).filter(function (b) { return b.level <= 0.5; }).length; }
function pendingItems() { var out = []; S.jobs.forEach(function (j) { j.items.forEach(function (it) { if (it.appr === 'pending') out.push({ j: j, it: it }); }); }); return out; }

/* ---------- navigation ---------- */
var MAIN = ['track', 'vehicles', 'stock'];
function go(view, extra) { S.back.push({ view: S.view, jobId: S.jobId, vehId: S.vehId }); S.view = view; Object.assign(S, extra || {}); S.sheet = null; }
function goRoot(view) { S.back = []; S.view = view; S.jobId = null; S.vehId = null; S.sheet = null; }

/* ---------- actions ---------- */
var A = {
  reset: function () { init(); render(); },
  nav: function (d) { goRoot(d.v); render(); },
  tab: function (d) { S.tab = d.v; render(); },
  back: function () { var b = S.back.pop(); if (!b) { goRoot('track'); } else { S.view = b.view; S.jobId = b.jobId; S.vehId = b.vehId; } S.sheet = null; render(); },
  plus: function () { S.sheet = { type: 'plus' }; render(); },
  hisaab: function () { go('hisaab'); render(); },
  settings: function () { go('settings'); render(); },
  scan: function () { go('scan'); render(); },
  plate: function (d) { handlePlate(d.v); },
  openJob: function (d) { go('job', { jobId: d.v }); render(); },
  openVeh: function (d) { go('vehicle', { vehId: d.v }); render(); },
  closeSheet: function () { S.sheet = null; render(); },

  // onboarding
  obStart: function () { S.ob = { step: 1, plate: '', name: '', phone: '', model: '', km: '', welcome: true, startJob: false }; go('onboard'); render(); },
  obPlate: function (d) { obSetPlate(d.v); },
  obModel: function (d) { S.ob.model = d.v; render(); },
  obNext: function () { if (S.ob.step === 2) { if (!S.ob.name.trim() || !S.ob.phone.trim()) { snack('Add the customer’s name and WhatsApp number.'); return render(); } if (!S.ob.model) S.ob.model = 'Two-wheeler'; } S.ob.step++; render(); },
  obBack: function () { if (S.ob.step > 1) { S.ob.step--; render(); } else A.back(); },
  obWelcome: function () { S.ob.welcome = !S.ob.welcome; render(); },
  obSave: function (d) { obSave(d.v === 'job'); },
  broadcast: function () { go('broadcast'); render(); },
  poster: function () { go('poster'); render(); },
  contact: function (d) { var c = S.contacts[+d.v]; c.on = !c.on; render(); },
  sendBroadcast: function () { var n = S.contacts.filter(function (c) { return c.on; }).length; S.sent.unshift({ to: null, t: tick(), text: 'Broadcast to ' + n + ' saved contacts: “Ganga Garage is now on WhatsApp — estimates, updates and bills here.”' }); snack('Invite sent to ' + n + ' contacts on WhatsApp.'); mark('onboard'); A.back(); },
  share: function () { snack('In the real app this opens the share sheet to print or send the poster.'); render(); },

  // job
  addSvc: function (d) { addSvc(job(S.jobId), d.v, 'inspection'); render(); },
  rmItem: function (d) {
    var j = job(S.jobId), it = j.items.find(function (i) { return i.id === d.v; });
    j.items = j.items.filter(function (i) { return i.id !== d.v; });
    if (it && it.svc && !j.items.some(function (i) { return i.svc === it.svc; })) j.services = j.services.filter(function (k) { return k !== it.svc; });
    render();
  },
  sendEstimate: function () {
    var j = job(S.jobId); if (!j.items.length) { snack('Add at least one service first.'); return render(); }
    j.status = 'estimated'; j.mech = j.mech || 'Ajay'; j.eta = j.eta || 'By 5 pm';
    send(veh(j.plate).cust, 'Estimate for ' + j.plate + ': ' + svcNames(j) + ' — ' + fmt(total(j)) + '. Big parts found later will need your OK.');
    snack('Estimate sent to ' + custOf(j).name + ' on WhatsApp.'); mark('estimate'); render();
  },
  mech: function (d) { job(S.jobId).mech = d.v; render(); },
  eta: function (d) { job(S.jobId).eta = d.v; render(); },
  start: function () {
    var j = job(S.jobId); j.status = 'inwork'; j.startedAt = nowStr();
    send(veh(j.plate).cust, 'Work started on your ' + veh(j.plate).model + ' by ' + j.mech + '. Ready ' + j.eta.toLowerCase() + '.');
    snack('Started. ' + first(custOf(j).name) + ' got a status update — no need to call.'); mark('start'); render();
  },
  openAdd: function () { S.sheet = { type: 'add', sel: null, reason: 'Worn out' }; render(); },
  pick: function (d) { S.sheet.sel = d.v; render(); },
  reason: function (d) { S.sheet.reason = d.v; render(); },
  confirmAdd: function () {
    var j = job(S.jobId), p = PARTS.find(function (x) { return x[0] === S.sheet.sel; }); if (!p) return;
    var it = item(p[1], p[2], 'part', 'added', p[0]); it.reason = S.sheet.reason; j.items.push(it); var c = custOf(j); S.sheet = null;
    if (p[2] >= S.threshold && !c.trust) {
      it.appr = 'pending';
      send(veh(j.plate).cust, 'Your OK needed: ' + p[1] + ' ' + fmt(p[2]) + ' (' + it.reason.toLowerCase() + '). Reply Yes / No / Call.'); it.at = nowStr();
      snack('Sent to ' + first(c.name) + ' for approval. It stays greyed out until they reply.'); mark('add');
    } else {
      deduct(it, j.plate);
      snack(c.trust ? 'Added. ' + first(c.name) + ' is on “jo theek lage”, so no approval was asked.' : 'Added — under ' + fmt(S.threshold) + ', no approval needed.');
    }
    render();
  },
  decide: function (d) {
    var j = job(d.j), it = j.items.find(function (i) { return i.id === d.i; }); if (!it || it.appr !== 'pending') return;
    var c = custOf(j);
    if (d.v === 'yes') { it.appr = 'yes'; deduct(it, j.plate); send(veh(j.plate).cust, 'Thank you. Adding ' + it.name + '. New total ' + fmt(total(j)) + '.'); snack(first(c.name) + ' said yes to ' + it.name + '. Stock updated.'); }
    else { it.appr = 'no'; send(veh(j.plate).cust, 'Okay, we won’t change the ' + it.name.toLowerCase() + '. Total stays ' + fmt(total(j)) + '.'); snack(first(c.name) + ' said no to ' + it.name + '. Left off the bill.'); }
    mark('reply'); render();
  },
  call: function () { var j = job(S.jobId) || null; var c = j ? custOf(j) : S.customers[veh(S.vehId).cust]; snack('Call ' + c.name + ': ' + c.phone); render(); },
  done: function () {
    var j = job(S.jobId), p = j.items.find(function (i) { return i.appr === 'pending'; });
    if (p) { snack('Still waiting for ' + first(custOf(j).name) + ' to answer about ' + p.name + '.'); return render(); }
    j.status = 'ready'; j.doneAt = nowStr();
    j.items.filter(counted).forEach(function (it) { deduct(it, j.plate); });
    var n = smallCount(j);
    if (n) { S.boxes.nuts.level = Math.max(0, S.boxes.nuts.level - n / S.boxes.nuts.size); S.boxes.washers.level = Math.max(0, S.boxes.washers.level - (n / 2) / S.boxes.washers.size); S.month.parts += n * 2; S.usage.unshift({ t: nowStr(), what: 'Nuts & bolts', qty: '−' + n + ' pcs', plate: j.plate }); }
    j.billNo = 'G-' + (S.billNo++);
    send(veh(j.plate).cust, 'Your ' + veh(j.plate).model + ' is ready to collect. Total ' + fmt(total(j)) + '. Bill ' + j.billNo + ' attached.');
    S.sheet = { type: 'bill' }; mark('done'); render();
  },
  openPay: function () { S.sheet = { type: 'bill' }; render(); },
  pay: function (d) {
    var j = job(S.jobId), t = total(j); S.sheet = null;
    if (d.v === 'later') { snack('Bill sent. Payment can be recorded when they collect.'); return render(); }
    j.status = 'closed'; j.paid = d.v; S.month.in += t;
    S.ledger.unshift({ day: 'Today', t: tick(), label: 'Bill · ' + j.plate + ' · ' + (svcNames(j) || 'Parts'), amt: t, mode: d.v });
    var extra = j.items.filter(function (i) { return i.src === 'added' && counted(i); }).map(function (i) { return i.name; });
    veh(j.plate).history.unshift({ date: TODAY, what: [svcNames(j)].concat(extra).filter(Boolean).join(', '), total: t, mech: j.mech });
    send(veh(j.plate).cust, 'Payment of ' + fmt(t) + ' received by ' + d.v + '. Thank you! Next service due around ' + dfmt(addMonths(TODAY, 3)) + '.');
    snack(fmt(t) + ' received by ' + d.v + '. Saved in Hisaab and the vehicle’s history.'); mark('pay');
    goRoot('track'); S.tab = 'ready'; render();
  },

  // vehicles
  vfilter: function (d) { S.vfilter = d.v; render(); },
  trust: function (d) { var c = S.customers[d.v]; c.trust = !c.trust; render(); },
  newJobFor: function (d) { var j = mkJob(d.v, 'walkin'); S.jobs.push(j); send(veh(d.v).cust, 'Namaste ' + first(S.customers[veh(d.v).cust].name) + '! Ganga Garage has opened a job card for your ' + veh(d.v).model + '.'); go('job', { jobId: j.id }); render(); },
  remind: function (d) { var v = veh(d.v); send(v.cust, 'Namaste ' + first(S.customers[v.cust].name) + ', your ' + v.model + ' is due for service. Come any day 8 am – 10 pm.'); snack('Service reminder sent to ' + S.customers[v.cust].name + '.'); render(); },

  // stock
  sfilter: function (d) { S.sfilter = d.v; render(); },
  stockItem: function (d) { S.sheet = { type: 'stock', kind: d.k, id: d.v, add: d.k === 'box' ? 2 : 10 }; render(); },
  addQty: function (d) { S.sheet.add = +d.v; render(); },
  restock: function () {
    var sh = S.sheet, label, cost;
    if (sh.kind === 'box') { var b = S.boxes[sh.id]; b.level += sh.add; cost = b.cost * sh.add; label = b.name + ' ×' + sh.add + ' boxes'; S.usage.unshift({ t: tick(), what: b.name, qty: '+' + sh.add + ' boxes', plate: 'Stock bought' }); }
    else { var s = S.stock[sh.id]; s.qty += sh.add; cost = s.cost * sh.add; label = s.name + ' ×' + sh.add; S.usage.unshift({ t: tick(), what: s.name, qty: '+' + sh.add, plate: 'Stock bought' }); }
    S.ledger.unshift({ day: 'Today', t: nowStr(), label: 'Stock bought · ' + label, amt: -cost, mode: 'Cash' }); S.month.exp += cost;
    S.sheet = null; snack('Added ' + label + '. ' + fmt(cost) + ' logged in Hisaab.'); mark('stock'); render();
  },
  reLevel: function (d) { var s = S.stock[S.sheet.id]; s.re = Math.max(0, s.re + (+d.v)); render(); },

  // hisaab & settings
  wage: function () { if (S.wagePaid) return; S.wagePaid = true; S.month.wages += 600; S.ledger.unshift({ day: 'Today', t: tick(), label: 'Wage · Ajay', amt: -600, mode: 'Cash' }); snack('Ajay’s wage for today recorded.'); render(); },
  thr: function (d) { S.threshold = +d.v; render(); }
};

function handlePlate(raw) {
  var plate = raw.toUpperCase().replace(/\s+/g, ' ').trim(); if (!plate) return;
  if (!veh(plate)) {
    S.ob = { step: 2, plate: plate, name: '', phone: '', model: '', km: '', welcome: true, startJob: true };
    S.back.pop(); go('onboard'); snack('New vehicle. Save the customer once — takes 20 seconds.'); render(); return;
  }
  var j = activeJob(plate);
  if (j && j.status === 'ticket') {
    j.status = 'draft'; j.likely.forEach(function (k) { addSvc(j, k, 'customer'); });
    snack('Linked to ' + first(custOf(j).name) + '’s WhatsApp message. Their words and likely services are filled in.'); mark('scan');
  } else if (!j) {
    j = mkJob(plate, 'walkin'); S.jobs.push(j); var c = custOf(j);
    send(veh(plate).cust, 'Namaste ' + first(c.name) + '! Ganga Garage has opened a job card for your ' + veh(plate).model + ' (' + plate + '). Updates will come here.');
    snack('New job card. ' + first(c.name) + ' got a WhatsApp hello.');
  } else snack('This vehicle already has a job open.');
  S.back.pop(); go('job', { jobId: j.id }); render();
}
function obSetPlate(raw) {
  var plate = raw.toUpperCase().replace(/\s+/g, ' ').trim(); if (!plate) return;
  if (veh(plate)) { snack(plate + ' is already saved — opening it.'); S.back.pop(); go('vehicle', { vehId: plate }); return render(); }
  S.ob.plate = plate; S.ob.step = 2; render();
}
function obSave(startJob) {
  var o = S.ob, id = 'c' + (S.seq++);
  S.customers[id] = { name: o.name.trim(), phone: o.phone.trim(), trust: false };
  S.vehicles[o.plate] = { model: o.model, cust: id, km: +o.km || 0, history: [] };
  if (o.welcome) send(id, 'Namaste ' + first(o.name.trim()) + '! You’re now saved with Ganga Garage for your ' + o.model + ' (' + o.plate + '). Estimates, updates and bills will come here. Reply “Menu” any time.');
  mark('onboard');
  var plate = o.plate; S.ob = null; goRoot('vehicles');
  if (startJob || o.startJob) { var j = mkJob(plate, 'walkin'); S.jobs.push(j); goRoot('track'); go('job', { jobId: j.id }); snack('Saved. Job card opened — pick the services.'); }
  else { go('vehicle', { vehId: plate }); snack('Saved ' + plate + '.' + (o.welcome ? ' Welcome message sent on WhatsApp.' : '')); }
  render();
}

/* ---------- shared UI pieces ---------- */
function ic(name, cls) { return '<span class="ms ' + (cls || '') + '" aria-hidden="true">' + name + '</span>'; }
function plateTag(p, lg) { return '<span class="plate ' + (lg ? 'lg' : '') + '">' + esc(p) + '</span>'; }
function topBar(title, sub) {
  return '<div class="appbar"><button class="ibtn plus" data-a="plus" aria-label="Add a customer or vehicle">' + ic('add') + '</button>' +
    '<div class="t"><h2>' + title + '</h2><div class="sub">' + sub + '</div></div>' +
    '<button class="ibtn" data-a="hisaab" aria-label="Hisaab — money">' + ic('account_balance_wallet') + '</button>' +
    '<button class="ibtn" data-a="settings" aria-label="Settings">' + ic('settings') + '</button></div>';
}
function subBar(title, sub, actions) {
  return '<div class="appbar"><button class="ibtn" data-a="back" aria-label="Back">' + ic('arrow_back') + '</button><div class="t"><h2>' + title + '</h2>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + (actions || '') + '</div>';
}
function navbar() {
  var items = [['track', 'Tracking', 'assignment'], ['vehicles', 'Vehicles', 'two_wheeler'], ['stock', 'Stock', 'inventory_2']];
  var al = alertsCount();
  return '<nav class="navbar" aria-label="Main">' + items.map(function (x) {
    var on = S.view === x[0];
    return '<button data-a="nav" data-v="' + x[0] + '" ' + (on ? 'aria-current="page"' : '') + '><span class="pill">' + ic(x[2], on ? 'fill' : '') + '</span>' + x[1] +
      (x[0] === 'stock' && al ? '<span class="badge">' + al + '</span>' : '') + '</button>';
  }).join('') + '</nav>';
}
var STATUS = {
  draft: ['Checking now', 'neutral', 1], estimated: ['Estimate sent', 'info', 2], inwork: ['In work', 'info', 3], ready: ['Ready', 'ok', 4], closed: ['Paid', 'ok', 5]
};

/* ---------- views ---------- */
function vTrack() {
  var T = S.jobs.filter(function (j) { return j.status === 'ticket'; }),
    W = S.jobs.filter(function (j) { return j.status === 'draft' || j.status === 'estimated'; }),
    I = S.jobs.filter(function (j) { return j.status === 'inwork'; }),
    R = S.jobs.filter(function (j) { return j.status === 'ready'; });
  var inGarage = W.length + I.length + R.length;
  var earned = S.ledger.filter(function (l) { return l.day === 'Today' && l.amt > 0; }).reduce(function (a, l) { return a + l.amt; }, 0);
  var lists = { waiting: W, inwork: I, ready: R }, cur = lists[S.tab];
  var h = topBar('Ganga Garage', 'Wed, 8 Oct · Tracking');
  h += '<div class="body">';
  h += '<div class="summary"><div><div class="v">' + inGarage + '</div><div class="l">In the garage</div></div><div><div class="v">' + pendingItems().length + '</div><div class="l">Waiting on customer</div></div><div><div class="v">' + fmt(earned) + '</div><div class="l">Earned today</div></div></div>';
  h += '<div class="tabs" role="tablist">' + [['waiting', 'Waiting', W.length + T.length], ['inwork', 'In work', I.length], ['ready', 'Ready', R.length]].map(function (t) {
    return '<button role="tab" aria-selected="' + (S.tab === t[0]) + '" data-a="tab" data-v="' + t[0] + '">' + t[1] + '<span class="cnt">' + t[2] + '</span></button>';
  }).join('') + '</div>';
  if (S.tab === 'waiting' && T.length) {
    h += '<div class="sec">' + ic('chat', '') + 'From WhatsApp · not arrived yet</div>';
    h += T.map(function (j) {
      var c = custOf(j);
      return '<div class="card dashed"><div class="row between">' + plateTag(j.plate) + '<span class="small muted">' + j.saidAt + '</span></div><div class="tm">' + esc(c.name) + ' · ' + esc(veh(j.plate).model) + '</div><div class="quote">“' + esc(j.said) + '”</div><div class="small muted">Opens by itself when you scan this plate.</div></div>';
    }).join('');
    if (W.length) h += '<div class="sec">At the garage</div>';
  }
  h += cur.length ? cur.map(jobCard).join('') : '<div class="empty">' + { waiting: 'No vehicles waiting.', inwork: 'Nothing in work right now.', ready: 'No vehicles ready for pickup.' }[S.tab] + '</div>';
  h += '</div><button class="fab" data-a="scan">' + ic('document_scanner') + 'Scan plate</button>' + navbar();
  return h;
}
function jobCard(j) {
  var v = veh(j.plate), c = custOf(j), st = STATUS[j.status], pend = j.items.some(function (i) { return i.appr === 'pending'; });
  var foot = { draft: 'Estimate not sent yet', estimated: (j.mech || 'Ajay') + ' next · ready ' + (j.eta || '').toLowerCase(), inwork: 'Started ' + (j.startedAt || '3:20 pm') + ' · ready ' + (j.eta || '').toLowerCase(), ready: 'Bill ' + fmt(total(j)) + ' · not paid yet' }[j.status];
  return '<button class="card" data-a="openJob" data-v="' + j.id + '">' +
    '<div class="row between">' + plateTag(j.plate) + '<span class="chip ' + (pend ? 'warn' : st[1]) + '">' + (pend ? ic('hourglass_top') + 'Waiting for customer' : st[0]) + '</span></div>' +
    '<div><div class="tm ell">' + esc(v.model) + '</div><div class="muted ell">' + esc(c.name) + ' · ' + esc(svcNames(j) || 'No services yet') + '</div></div>' +
    '<div class="progress" aria-hidden="true"><i style="width:' + (st[2] * 20) + '%"></i></div>' +
    '<div class="row">' + (j.mech ? '<span class="avatar" style="width:26px;height:26px;font-size:11px">' + initials(j.mech) + '</span>' : '') + '<span class="small muted grow ell">' + foot + '</span>' + (j.via === 'whatsapp' ? '<span class="chip wa">' + ic('chat') + 'WhatsApp</span>' : '') + '</div></button>';
}
function vScan() {
  var demo = [['MH 39 AB 4521', 'Sunil Patil · sent a WhatsApp message'], ['MH 39 Q 7788', 'Ganesh More · regular, walks in'], ['MH 18 BX 3302', 'New vehicle · never been here']];
  return '<div class="appbar" style="background:var(--cam);color:#fff"><button class="ibtn" style="color:#fff" data-a="back" aria-label="Back">' + ic('arrow_back') + '</button><div class="t"><h2>Scan number plate</h2></div></div>' +
    '<div class="cam"><div class="viewfinder"><div class="frame"></div><div class="hint">Hold the plate inside the frame</div></div>' +
    '<div class="small" style="opacity:.75">Demo — pick the plate in front of the camera</div>' +
    '<div class="demo-plates">' + demo.map(function (d) { return '<button data-a="plate" data-v="' + d[0] + '">' + plateTag(d[0]) + '<span class="small muted">' + d[1] + '</span></button>'; }).join('') + '</div>' +
    '<form id="manual" autocomplete="off"><input id="manual-plate" name="plate" placeholder="Or type the plate" aria-label="Type the number plate"><button class="btn filled" type="submit">Go</button></form></div>';
}
function itemRow(it, j, editable) {
  var src = { customer: 'From customer’s message', inspection: 'Added at inspection', added: 'Added during work' }[it.src];
  var st = '';
  if (it.appr === 'pending') st = '<div class="small" style="margin-top:6px;color:var(--on-surface)">' + ic('hourglass_top', '') + ' Waiting for ' + esc(first(custOf(j).name)) + '’s reply on WhatsApp · sent ' + it.at + '</div><div class="row" style="margin-top:4px;gap:4px"><button class="btn text" data-a="decide" data-j="' + j.id + '" data-i="' + it.id + '" data-v="yes">They said yes</button><button class="btn text" data-a="decide" data-j="' + j.id + '" data-i="' + it.id + '" data-v="no">They said no</button></div>';
  else if (it.appr === 'yes') st = '<div style="margin-top:6px"><span class="chip ok">' + ic('check') + 'Customer approved</span></div>';
  else if (it.appr === 'no') st = '<div style="margin-top:6px"><span class="chip neutral">Customer said no</span></div>';
  return '<div class="li ' + (it.appr === 'pending' ? 'pending' : '') + ' ' + (it.appr === 'no' ? 'declined' : '') + '"><div class="grow"><div class="nm">' + esc(it.name) + '</div><div class="src">' + src + (it.reason ? ' · ' + esc(it.reason) : '') + '</div>' + st + '</div><span class="amt">' + fmt(it.price) + '</span>' +
    (editable ? '<button class="ibtn" data-a="rmItem" data-v="' + it.id + '" aria-label="Remove ' + esc(it.name) + '">' + ic('close') + '</button>' : '') + '</div>';
}
function vJob() {
  var j = job(S.jobId), v = veh(j.plate), c = custOf(j), st = STATUS[j.status][2], edit = j.status === 'draft', cons = consumables(j);
  var h = subBar(plateTag(j.plate, true), esc(v.model) + ' · ' + esc(c.name),
    '<button class="ibtn" data-a="openVeh" data-v="' + j.plate + '" aria-label="Vehicle history">' + ic('history') + '</button><button class="ibtn" data-a="call" aria-label="Call customer">' + ic('call') + '</button>');
  h += '<div class="body nonav">';
  h += '<div><div class="stepper">' + [1, 2, 3, 4, 5].map(function (i) { return '<span class="' + (i <= st ? 'on' : '') + '"></span>'; }).join('') + '</div><div class="steplbl">' + ['Estimate', 'Waiting', 'In work', 'Ready', 'Paid'].map(function (l, i) { return '<span class="' + (i + 1 === st ? 'on' : '') + '">' + l + '</span>'; }).join('') + '</div></div>';
  if (j.said) h += '<div class="card"><div class="row small muted">' + ic('chat', '') + esc(first(c.name)) + ' wrote on WhatsApp · ' + j.saidAt + '</div><div class="quote">“' + esc(j.said) + '”</div></div>';
  if (c.trust) h += '<div class="row small muted">' + ic('handshake') + '“Jo theek lage” — regular customer, no approvals asked</div>';
  h += '<div class="sec">' + (edit ? 'Agree the work face to face, then send' : 'Work on this vehicle') + '</div>';
  h += '<div class="list">' + (j.items.map(function (it) { return itemRow(it, j, edit); }).join('') || '<div class="li muted">Pick services below.</div>') +
    (cons ? '<div class="li"><div class="grow"><div class="nm">Consumables</div><div class="src">Nuts, bolts, washers · counted by the box</div></div><span class="amt">' + fmt(cons) + '</span></div>' : '') +
    '<div class="li total"><div class="grow nm">Total</div><span class="amt">' + fmt(total(j)) + '</span></div></div>';
  if (edit) {
    var rest = Object.keys(SERV).filter(function (k) { return j.services.indexOf(k) < 0; });
    h += '<div class="sec">Add from rate card</div><div class="tiles">' + rest.map(function (k) { var s = SERV[k]; return '<button class="tile" data-a="addSvc" data-v="' + k + '">' + ic(s.icon) + '<span class="tm" style="font-size:14px">' + s.name + '</span><span class="p">' + fmt(s.lines.reduce(function (a, l) { return a + l[1]; }, 0)) + '</span></button>'; }).join('') + '</div>';
  }
  if (j.status === 'estimated') {
    h += '<div class="sec">Who works on it</div><div class="seg">' + MECHS.map(function (m) { return '<button data-a="mech" data-v="' + m + '" aria-pressed="' + (j.mech === m) + '">' + (j.mech === m ? ic('check') : '') + m + '</button>'; }).join('') + '</div>';
    h += '<div class="sec">Ready by</div><div class="fchips">' + ETAS.map(function (e) { return '<button class="fchip" data-a="eta" data-v="' + e + '" aria-pressed="' + (j.eta === e) + '">' + e + '</button>'; }).join('') + '</div>';
    h += '<div class="small muted">' + esc(first(c.name)) + ' will get “Started by ' + j.mech + ' · ready ' + (j.eta || '').toLowerCase() + '” — no queue number. <span class="tag">Proposed</span></div>';
  }
  if (j.status === 'inwork') h += '<div class="small muted">Found something new? Tap Add item. Parts over ' + fmt(S.threshold) + ' wait for the customer’s OK.</div>';
  if (j.status === 'ready') h += '<div class="card outlined"><div class="row">' + ic('receipt_long') + '<div class="grow"><div class="tm">Bill ' + j.billNo + '</div><div class="small muted">Made at Done ' + (j.doneAt || '') + ' · sent to ' + esc(first(c.name)) + ' on WhatsApp</div></div><span class="chip wa">' + ic('done_all') + 'Sent</span></div></div>';
  h += '</div>';
  var bar = {
    draft: '<button class="btn filled big" data-a="sendEstimate">' + ic('send') + 'Send estimate</button>',
    estimated: '<button class="btn filled big" data-a="start">' + ic('play_arrow') + 'Start work</button>',
    inwork: '<button class="btn tonal big" data-a="openAdd">' + ic('add') + 'Add item</button><button class="btn filled big" data-a="done">' + ic('check') + 'Mark done</button>',
    ready: '<button class="btn filled big" data-a="openPay">' + ic('payments') + 'Record payment</button>'
  }[j.status];
  if (bar) h += '<div class="actionbar">' + bar + '</div>';
  return h;
}
function vVehicles() {
  var q = S.search.toLowerCase();
  var vs = Object.keys(S.vehicles).filter(function (p) {
    var v = S.vehicles[p], c = S.customers[v.cust];
    if (q && (p + ' ' + v.model + ' ' + c.name + ' ' + c.phone).toLowerCase().indexOf(q) < 0) return false;
    if (S.vfilter === 'in') return !!S.jobs.find(function (j) { return j.plate === p && ['draft', 'estimated', 'inwork', 'ready'].indexOf(j.status) > -1; });
    if (S.vfilter === 'due') return isDue(p);
    return true;
  });
  var dueN = Object.keys(S.vehicles).filter(isDue).length;
  var h = topBar('Vehicles', Object.keys(S.vehicles).length + ' saved · every visit and bill');
  h += '<div class="body"><div class="searchwrap">' + ic('search') + '<input class="search" id="vsearch" placeholder="Plate, model, name or phone" aria-label="Search vehicles" value="' + esc(S.search) + '"></div>';
  h += '<div class="fchips">' + [['all', 'All'], ['in', 'In garage now'], ['due', 'Due for service · ' + dueN]].map(function (f) { return '<button class="fchip" data-a="vfilter" data-v="' + f[0] + '" aria-pressed="' + (S.vfilter === f[0]) + '">' + (S.vfilter === f[0] ? ic('check') : '') + f[1] + '</button>'; }).join('') + '</div>';
  h += vs.length ? '<div class="list">' + vs.map(function (p) {
    var v = S.vehicles[p], c = S.customers[v.cust], l = lastVisit(p), aj = activeJob(p), due = isDue(p);
    var right = aj && aj.status !== 'ticket' ? '<span class="chip info">In garage</span>' : due ? '<span class="chip warn">Due</span>' : '';
    return '<button class="li" data-a="openVeh" data-v="' + p + '"><div class="grow"><div class="row">' + plateTag(p) + right + '</div><div class="tm ell" style="margin-top:6px;font-size:15px">' + esc(v.model) + '</div><div class="src">' + esc(c.name) + ' · ' + (l ? 'last visit ' + dfmt(l.date) : 'no visits yet') + '</div></div>' + ic('chevron_right') + '</button>';
  }).join('') + '</div>' : '<div class="empty">No vehicles match. Tap + to add one.</div>';
  h += '</div>' + navbar();
  return h;
}
function vVehicle() {
  var p = S.vehId, v = veh(p), c = S.customers[v.cust], l = lastVisit(p), aj = activeJob(p);
  var spent = v.history.reduce(function (a, x) { return a + x.total; }, 0);
  var h = subBar(plateTag(p, true), esc(v.model), '<button class="ibtn" data-a="call" aria-label="Call owner">' + ic('call') + '</button>');
  h += '<div class="body nonav">';
  h += '<div class="card"><div class="row"><span class="avatar">' + initials(c.name) + '</span><div class="grow"><div class="tm">' + esc(c.name) + '</div><div class="small muted">' + c.phone + ' · WhatsApp</div></div></div>' +
    '<div class="row"><div class="grow"><div class="small">Jo theek lage — skip approvals <span class="tag">Considering</span></div><div class="src">For regulars who trust you with any part</div></div><button class="toggle" role="switch" aria-checked="' + c.trust + '" aria-label="Skip approvals for ' + esc(c.name) + '" data-a="trust" data-v="' + v.cust + '"></button></div></div>';
  h += '<div class="stat-grid"><div class="stat"><div class="small muted">Visits</div><div class="v">' + v.history.length + '</div></div><div class="stat"><div class="small muted">Total spent</div><div class="v">' + fmt(spent) + '</div></div>' +
    '<div class="stat"><div class="small muted">Last visit</div><div class="v" style="font-size:15px">' + (l ? dfmt(l.date) : '—') + '</div></div><div class="stat"><div class="small muted">Next service <span class="tag">Proposed</span></div><div class="v" style="font-size:15px;' + (isDue(p) ? 'color:var(--error)' : '') + '">' + (l ? (isDue(p) ? 'Overdue' : dfmt(addMonths(l.date, 3))) : '—') + '</div></div></div>';
  if (v.km) h += '<div class="small muted">' + ic('speed') + ' About ' + v.km.toLocaleString('en-IN') + ' km on the meter at last visit</div>';
  if (aj && aj.status !== 'ticket') h += '<div class="sec">In the garage now</div>' + jobCard(aj);
  else if (aj && aj.status === 'ticket') h += '<div class="card dashed"><div class="small muted">' + ic('chat') + ' Sent a WhatsApp message · ' + aj.saidAt + '</div><div class="quote">“' + esc(aj.said) + '”</div><div class="small muted">Scan the plate when they arrive.</div></div>';
  else h += '<button class="btn filled big block" data-a="newJobFor" data-v="' + p + '">' + ic('add_task') + 'Start a job for this vehicle</button>' + (isDue(p) ? '<button class="btn outline block" data-a="remind" data-v="' + p + '">' + ic('notifications') + 'Send service reminder on WhatsApp</button>' : '');
  h += '<div class="sec">History</div>';
  h += v.history.length ? '<div class="timeline">' + v.history.map(function (x) { return '<div class="tl"><div class="rail"><i></i><b></b></div><div class="c"><div class="row between"><span class="tm" style="font-size:15px">' + dfmt(x.date) + '</span><span class="num" style="font-weight:500">' + fmt(x.total) + '</span></div><div class="small muted">' + esc(x.what) + (x.mech ? ' · by ' + x.mech : '') + '</div></div></div>'; }).join('') + '</div>' : '<div class="empty">No visits yet. The first bill will start the history.</div>';
  h += '</div>';
  return h;
}
function vStock() {
  var parts = Object.keys(S.stock), boxes = Object.keys(S.boxes);
  var low = parts.filter(function (k) { return S.stock[k].qty <= S.stock[k].re; }), lowB = boxes.filter(function (k) { return S.boxes[k].level <= 0.5; });
  var value = parts.reduce(function (a, k) { return a + S.stock[k].qty * S.stock[k].cost; }, 0);
  var usedToday = S.usage.filter(function (u) { return u.qty.charAt(0) === '−'; }).length;
  var h = topBar('Stock', 'Goes down by itself as jobs finish');
  h += '<div class="body">';
  h += '<div class="summary"><div><div class="v" style="' + (low.length + lowB.length ? 'color:var(--error)' : '') + '">' + (low.length + lowB.length) + '</div><div class="l">To restock</div></div><div><div class="v">' + fmt(value) + '</div><div class="l">Parts on shelf</div></div><div><div class="v">' + usedToday + '</div><div class="l">Used today</div></div></div>';
  h += '<div class="fchips">' + [['all', 'All'], ['low', 'Restock'], ['parts', 'Parts'], ['boxes', 'Small parts']].map(function (f) { return '<button class="fchip" data-a="sfilter" data-v="' + f[0] + '" aria-pressed="' + (S.sfilter === f[0]) + '">' + (S.sfilter === f[0] ? ic('check') : '') + f[1] + '</button>'; }).join('') + '</div>';
  var showP = S.sfilter === 'all' || S.sfilter === 'parts' || S.sfilter === 'low', showB = S.sfilter === 'all' || S.sfilter === 'boxes' || S.sfilter === 'low';
  var pl = S.sfilter === 'low' ? low : parts, bl = S.sfilter === 'low' ? lowB : boxes;
  if (showP && pl.length) h += '<div class="sec">Parts · counted in pieces</div><div class="list">' + pl.map(function (k) {
    var s = S.stock[k], lo = s.qty <= s.re;
    return '<button class="li" data-a="stockItem" data-k="pc" data-v="' + k + '"><div class="grow"><div class="row between"><span>' + s.name + '</span><span class="num" style="font-weight:700;' + (lo ? 'color:var(--error)' : '') + '">' + s.qty + '</span></div><div class="meter ' + (lo ? 'low' : '') + '" style="margin-top:8px"><i style="width:' + Math.min(100, s.qty / (s.re * 3) * 100) + '%"></i></div><div class="src">' + (lo ? 'Restock now · ' : '') + 'restock at ' + s.re + ' · ' + fmt(s.cost) + ' each</div></div></button>';
  }).join('') + '</div>';
  if (showB && bl.length) h += '<div class="sec">Small parts · counted in boxes</div><div class="list">' + bl.map(function (k) {
    var b = S.boxes[k], lo = b.level <= 0.5;
    return '<button class="li" data-a="stockItem" data-k="box" data-v="' + k + '"><div class="grow"><div class="row between"><span>' + b.name + '</span><span class="small num" style="' + (lo ? 'color:var(--error);font-weight:700' : '') + '">' + b.level.toFixed(2) + ' boxes</span></div><div class="meter ' + (lo ? 'low' : '') + '" style="margin-top:8px"><i style="width:' + Math.min(100, b.level / 3 * 100) + '%"></i></div><div class="src">~' + Math.round(b.level * b.size) + ' pcs · alert when the last box is half used</div></div></button>';
  }).join('') + '</div>';
  if (S.sfilter === 'low' && !low.length && !lowB.length) h += '<div class="empty">Nothing to restock. Shelves look full.</div>';
  h += '<div class="sec">Movement today</div><div class="list">' + S.usage.slice(0, 8).map(function (u) { return '<div class="li"><div class="grow"><div>' + esc(u.what) + '</div><div class="src">' + u.t + ' · ' + esc(u.plate) + '</div></div><span class="amt ' + (u.qty.charAt(0) === '+' ? 'plus' : '') + '">' + u.qty + '</span></div>'; }).join('') + '</div>';
  h += '<div class="small muted">Small parts are never counted one by one: each service has an average use (brake check ≈ 5 nuts) and a finished job takes that share of a box.</div>';
  h += '</div>' + navbar();
  return h;
}
function vHisaab() {
  var m = S.month, profit = m.in - m.parts - m.wages - m.exp, days = [];
  S.ledger.forEach(function (l) { if (days.indexOf(l.day) < 0) days.push(l.day); });
  var h = subBar('Hisaab', 'October so far · from bills, stock and wages');
  h += '<div class="body nonav"><div class="hero"><div class="small">Profit this month</div><div class="v">' + fmt(profit) + '</div><div class="small">“Isme profit hai” — and now you can see it.</div></div>';
  h += '<div class="stat-grid"><div class="stat"><div class="small muted">Money in</div><div class="v plus">' + fmt(m.in) + '</div></div><div class="stat"><div class="small muted">Parts used</div><div class="v">' + fmt(m.parts) + '</div></div><div class="stat"><div class="small muted">Wages</div><div class="v">' + fmt(m.wages) + '</div></div><div class="stat"><div class="small muted">Rent & stock bought</div><div class="v">' + fmt(m.exp) + '</div></div></div>';
  h += '<button class="btn outline block" data-a="wage" ' + (S.wagePaid ? 'disabled' : '') + '>' + ic('person') + (S.wagePaid ? 'Ajay’s wage recorded for today' : 'Record today’s wage · Ajay ₹600') + '</button>';
  h += days.map(function (d) { return '<div class="sec">' + d + '</div><div class="list">' + S.ledger.filter(function (l) { return l.day === d; }).map(function (l) { return '<div class="li">' + ic(l.amt > 0 ? 'receipt_long' : l.label.indexOf('Wage') === 0 ? 'person' : 'inventory_2') + '<div class="grow"><div class="ell">' + esc(l.label) + '</div><div class="src">' + l.t + ' · ' + l.mode + '</div></div><span class="amt ' + (l.amt > 0 ? 'plus' : '') + '">' + (l.amt > 0 ? '+' : '−') + fmt(Math.abs(l.amt)) + '</span></div>'; }).join('') + '</div>'; }).join('');
  h += '<div class="row small muted">' + ic('help') + 'Udhari (customer credit) is not tracked yet <span class="tag">Open</span></div></div>';
  return h;
}
function vSettings() {
  var h = subBar('Settings');
  h += '<div class="body nonav"><div class="sec">Ask the customer before adding parts above <span class="tag">Proposed</span></div><div class="seg">' + [200, 300, 500, 1000].map(function (v) { return '<button data-a="thr" data-v="' + v + '" aria-pressed="' + (S.threshold === v) + '">' + fmt(v) + '</button>'; }).join('') + '</div><div class="small muted">Cheaper parts and nuts & bolts go straight on the bill.</div>';
  h += '<div class="sec">Rate card</div><div class="list">' + Object.keys(SERV).map(function (k) { var s = SERV[k]; return '<div class="li">' + ic(s.icon) + '<div class="grow">' + s.name + '<div class="src">' + s.lines.map(function (l) { return l[0]; }).join(' + ') + '</div></div><span class="amt">' + fmt(s.lines.reduce(function (a, l) { return a + l[1]; }, 0)) + '</span></div>'; }).join('') + '</div>';
  h += '<div class="sec">Mechanics</div><div class="list"><div class="li"><span class="avatar">AJ</span><div class="grow">Ajay</div><span class="muted">₹600 / day</span></div><div class="li"><span class="avatar">JJ</span><div class="grow">Jithendra ji (owner)</div><span class="muted">—</span></div></div>';
  h += '<div class="sec">Language</div><div class="list"><div class="li"><div class="grow">English · हिंदी · मराठी</div><span class="tag">Open</span></div></div></div>';
  return h;
}
function vOnboard() {
  var o = S.ob, h = '<div class="appbar"><button class="ibtn" data-a="obBack" aria-label="Back">' + ic('arrow_back') + '</button><div class="t"><h2>New customer</h2><div class="sub">Step ' + o.step + ' of 3 · ' + ['Number plate', 'Customer & vehicle', 'Check and save'][o.step - 1] + '</div></div></div>';
  h += '<div style="padding:0 16px 8px"><div class="stepper" style="grid-template-columns:repeat(3,1fr)">' + [1, 2, 3].map(function (i) { return '<span class="' + (i <= o.step ? 'on' : '') + '"></span>'; }).join('') + '</div></div>';
  if (o.step === 1) {
    h += '<div class="cam"><div class="viewfinder"><div class="frame"></div><div class="hint">Scan the plate to start</div></div><div class="small" style="opacity:.75">Demo — pick the plate in front of the camera</div><div class="demo-plates"><button data-a="obPlate" data-v="MH 18 BX 3302">' + plateTag('MH 18 BX 3302') + '<span class="small muted">New · Vikas Gavit’s bike</span></button><button data-a="obPlate" data-v="MH 39 AB 4521">' + plateTag('MH 39 AB 4521') + '<span class="small muted">Already saved</span></button></div><form id="obplate" autocomplete="off"><input id="ob-plate" placeholder="Or type the plate" aria-label="Type the number plate"><button class="btn filled" type="submit">Next</button></form></div>';
    return h;
  }
  h += '<div class="body nonav">';
  if (o.step === 2) {
    h += '<div class="row">' + plateTag(o.plate, true) + '<span class="small muted">First visit — save once</span></div>';
    h += '<div class="field"><label for="ob-name">Customer name</label><input id="ob-name" data-ob="name" value="' + esc(o.name) + '" placeholder="e.g. Vikas Gavit" autocomplete="off"></div>';
    h += '<div class="field"><label for="ob-phone">WhatsApp number</label><input id="ob-phone" data-ob="phone" value="' + esc(o.phone) + '" placeholder="10-digit mobile" inputmode="tel" autocomplete="off"></div>';
    h += '<div class="sec">Vehicle</div><div class="fchips">' + MODELS.map(function (m) { return '<button class="fchip" data-a="obModel" data-v="' + m + '" aria-pressed="' + (o.model === m) + '">' + (o.model === m ? ic('check') : '') + m + '</button>'; }).join('') + '</div>';
    h += '<div class="field"><label for="ob-km">Km on the meter (optional)</label><input id="ob-km" data-ob="km" value="' + esc(o.km) + '" inputmode="numeric" autocomplete="off"></div>';
    h += '<button class="btn text" style="align-self:flex-start" data-a="obFill">' + ic('bolt') + 'Fill sample details</button>';
    h += '</div><div class="actionbar"><button class="btn filled big" data-a="obNext">Next</button></div>';
  } else {
    h += '<div class="card"><div class="row">' + plateTag(o.plate, true) + '</div><div class="tm">' + esc(o.model) + '</div><div class="muted">' + esc(o.name) + ' · ' + esc(o.phone) + (o.km ? ' · ' + esc(o.km) + ' km' : '') + '</div></div>';
    h += '<div class="row between"><div><div class="tm" style="font-size:15px">Send a welcome on WhatsApp</div><div class="small muted">So they can message the garage later</div></div><button class="toggle" role="switch" aria-checked="' + o.welcome + '" aria-label="Send welcome message" data-a="obWelcome"></button></div>';
    if (o.welcome) h += '<div class="waprev small">Namaste ' + esc(first(o.name)) + '! You’re now saved with <b>Ganga Garage</b> for your ' + esc(o.model) + ' (' + esc(o.plate) + '). Estimates, updates and bills will come here. Reply “Menu” any time.</div>';
    h += '</div><div class="actionbar"><button class="btn outline big" data-a="obSave" data-v="only">Save only</button><button class="btn filled big" data-a="obSave" data-v="job">Save & start job</button></div>';
  }
  return h;
}
function vBroadcast() {
  var n = S.contacts.filter(function (c) { return c.on; }).length;
  var h = subBar('Invite from contacts', 'Your saved customers, one message');
  h += '<div class="body nonav"><div class="small muted">You already save customers by bike and name. Send them one message so they can reach the garage on WhatsApp.</div>';
  h += '<div class="waprev small">Namaste! Ganga Garage is now on WhatsApp. Send your problem here before you come, get the estimate, updates and your bill. — Jithendra ji</div>';
  h += '<div class="list">' + S.contacts.map(function (c, i) { return '<button class="li" data-a="contact" data-v="' + i + '"><span class="check" role="checkbox" aria-checked="' + c.on + '">' + (c.on ? ic('check') : '') + '</span><span class="grow">' + esc(c.name) + '</span></button>'; }).join('') + '</div></div>';
  h += '<div class="actionbar"><button class="btn filled big" data-a="sendBroadcast" ' + (n ? '' : 'disabled') + '>' + ic('send') + 'Send to ' + n + ' contacts</button></div>';
  return h;
}
function vPoster() {
  var h = subBar('Garage QR poster', 'Put it at the counter and on every bill');
  h += '<div class="body nonav"><div class="poster"><div class="tm" style="font-size:22px">Ganga Garage</div><div class="small muted">Dhule Road, Nandurbar · 8 am – 10 pm</div><div class="qr" aria-label="QR code placeholder"></div><div style="line-height:1.45">Scan to message us on WhatsApp.<br>Estimate before work · updates while you wait · bill on your phone.</div><div class="small muted">Powered by ____ (app name to be decided)</div></div>';
  h += '<div class="small muted">Customers who scan land in the garage’s WhatsApp chat — that becomes their first ticket.</div></div><div class="actionbar"><button class="btn filled big" data-a="share">' + ic('share') + 'Share or print poster</button></div>';
  return h;
}

/* ---------- sheets ---------- */
function sheetHTML() {
  if (!S.sheet) return '';
  var sh = S.sheet, h = '';
  if (sh.type === 'plus') {
    h = '<h3>Add</h3><div class="small muted">Bring new customers into the garage’s system</div>' +
      '<button class="opt" data-a="obStart"><span class="ic">' + ic('person_add') + '</span><span class="grow"><b>New customer & vehicle</b><div class="src">Scan the plate, save name and WhatsApp once</div></span></button>' +
      '<button class="opt" data-a="broadcast"><span class="ic">' + ic('campaign') + '</span><span class="grow"><b>Invite from phone contacts</b><div class="src">One WhatsApp message to saved customers</div></span></button>' +
      '<button class="opt" data-a="poster"><span class="ic">' + ic('qr_code_2') + '</span><span class="grow"><b>Garage QR poster</b><div class="src">For the counter and every bill</div></span></button>' +
      '<div class="small muted">Onboarding is still being designed by the team. <span class="tag">Open</span></div>';
  }
  if (sh.type === 'add') {
    var j = job(S.jobId), c = custOf(j), p = PARTS.find(function (x) { return x[0] === sh.sel; }), needs = p && p[2] >= S.threshold && !c.trust;
    h = '<h3>Add item</h3><div class="small muted">Found something new while working?</div><div style="display:flex;flex-direction:column;gap:8px">' + PARTS.map(function (x) {
      var s = S.stock[x[0]], big = x[2] >= S.threshold && !c.trust;
      return '<button class="opt" data-a="pick" data-v="' + x[0] + '" aria-pressed="' + (sh.sel === x[0]) + '"><span class="grow">' + x[1] + '<div class="src">' + (s ? s.qty + ' in stock' : '') + '</div></span>' + (big ? '<span class="chip warn" style="height:24px">Needs OK</span>' : '') + '<span class="amt">' + fmt(x[2]) + '</span></button>';
    }).join('') + '</div>' +
      '<div class="sec">Why</div><div class="fchips">' + REASONS.map(function (r) { return '<button class="fchip" data-a="reason" data-v="' + r + '" aria-pressed="' + (sh.reason === r) + '">' + r + '</button>'; }).join('') + '</div>' +
      '<button class="btn filled big block" data-a="confirmAdd" ' + (p ? '' : 'disabled') + '>' + (!p ? 'Pick an item' : needs ? 'Ask ' + esc(first(c.name)) + ' on WhatsApp' : 'Add to bill') + '</button>';
  }
  if (sh.type === 'bill') {
    var jb = job(S.jobId), cb = custOf(jb);
    h = '<h3>Bill ' + jb.billNo + '</h3><div class="row"><span class="chip wa">' + ic('done_all') + 'Sent to ' + esc(first(cb.name)) + ' on WhatsApp</span></div>' +
      '<div class="list">' + jb.items.filter(counted).map(function (i) { return '<div class="li"><div class="grow">' + esc(i.name) + (i.appr === 'yes' ? '<div class="src">Approved on WhatsApp</div>' : '') + '</div><span class="amt">' + fmt(i.price) + '</span></div>'; }).join('') +
      (consumables(jb) ? '<div class="li"><div class="grow">Consumables</div><span class="amt">' + fmt(consumables(jb)) + '</span></div>' : '') +
      '<div class="li total"><div class="grow nm">Total</div><span class="amt">' + fmt(total(jb)) + '</span></div></div>' +
      '<div class="small muted">90-day guarantee printed on the bill. Next service date added for the customer.</div>' +
      '<div class="sec">How did they pay?</div><div style="display:flex;flex-direction:column;gap:8px">' +
      '<button class="opt" data-a="pay" data-v="Cash"><span class="ic">' + ic('payments') + '</span><span class="grow">Cash</span></button>' +
      '<button class="opt" data-a="pay" data-v="UPI"><span class="ic">' + ic('qr_code_2') + '</span><span class="grow">UPI</span></button>' +
      '<button class="opt" data-a="pay" data-v="later"><span class="ic">' + ic('schedule') + '</span><span class="grow">Not yet — when they collect</span></button>' +
      '<div class="opt" style="opacity:.5"><span class="ic">' + ic('menu_book') + '</span><span class="grow">Udhari — pay later</span><span class="tag">Open</span></div></div>';
  }
  if (sh.type === 'stock') {
    if (sh.kind === 'box') {
      var b = S.boxes[sh.id];
      h = '<h3>' + b.name + '</h3><div class="row between"><span class="muted">In the shop</span><span class="tm num">' + b.level.toFixed(2) + ' boxes · ~' + Math.round(b.level * b.size) + ' pcs</span></div><div class="meter ' + (b.level <= 0.5 ? 'low' : '') + '"><i style="width:' + Math.min(100, b.level / 3 * 100) + '%"></i></div>' +
        '<div class="small muted">Box of ' + b.size + ' · ' + fmt(b.cost) + ' per box. Goes down by the average each service uses — nobody counts pieces.</div>' +
        '<div class="sec">Bought new boxes</div><div class="seg">' + [1, 2, 4].map(function (n) { return '<button data-a="addQty" data-v="' + n + '" aria-pressed="' + (sh.add === n) + '">+' + n + '</button>'; }).join('') + '</div>' +
        '<button class="btn filled big block" data-a="restock">Add ' + sh.add + ' box' + (sh.add > 1 ? 'es' : '') + ' · ' + fmt(b.cost * sh.add) + '</button>';
    } else {
      var s = S.stock[sh.id], used = S.usage.filter(function (u) { return u.what === s.name; });
      h = '<h3>' + s.name + '</h3><div class="row between"><span class="muted">On the shelf</span><span class="tm num" style="font-size:28px;' + (s.qty <= s.re ? 'color:var(--error)' : '') + '">' + s.qty + '</span></div>' +
        '<div class="row between"><span class="muted">Alert me at</span><div class="row"><button class="ibtn" data-a="reLevel" data-v="-1" aria-label="Lower restock level">' + ic('remove') + '</button><span class="tm num">' + s.re + '</span><button class="ibtn" data-a="reLevel" data-v="1" aria-label="Raise restock level">' + ic('add') + '</button></div></div>' +
        '<div class="small muted">Buy ' + fmt(s.cost) + ' · sell ' + fmt(s.price) + ' · margin ' + fmt(s.price - s.cost) + ' each</div>' +
        (used.length ? '<div class="sec">Recent movement</div><div class="list">' + used.slice(0, 4).map(function (u) { return '<div class="li"><div class="grow">' + esc(u.plate) + '<div class="src">' + u.t + '</div></div><span class="amt ' + (u.qty.charAt(0) === '+' ? 'plus' : '') + '">' + u.qty + '</span></div>'; }).join('') + '</div>' : '') +
        '<div class="sec">Bought new stock</div><div class="seg">' + [5, 10, 20].map(function (n) { return '<button data-a="addQty" data-v="' + n + '" aria-pressed="' + (sh.add === n) + '">+' + n + '</button>'; }).join('') + '</div>' +
        '<button class="btn filled big block" data-a="restock">Add ' + sh.add + ' · ' + fmt(s.cost * sh.add) + '</button>';
    }
  }
  return '<div class="scrim" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="handle"></div><div class="sb">' + h + '</div></div>';
}

/* ---------- demo panel (stands in for the customer side) ---------- */
var GUIDE = [['scan', 'Tap Scan plate → MH 39 AB 4521 (Sunil messaged on WhatsApp)'], ['estimate', 'Check the list, then Send estimate'], ['start', 'Pick mechanic and time, Start work'], ['add', 'Add item → Brake shoe set (₹450 needs an OK)'], ['reply', 'Answer for Sunil below, or tap “They said yes”'], ['done', 'Mark done — the bill makes itself'], ['pay', 'Record payment, then open Hisaab (wallet icon)'], ['stock', 'In Stock, restock the headlight bulbs'], ['onboard', 'Tap + to add a new customer']];
function panelHTML() {
  var h = '<div class="pcard"><h2>' + ic('route') + 'Try one job, start to finish</h2><ol class="steps">' + GUIDE.map(function (g, i) { var d = S.progress[g[0]]; return '<li class="' + (d ? 'done' : '') + '"><span class="n">' + (d ? '✓' : i + 1) + '</span><span>' + g[1] + '</span></li>'; }).join('') + '</ol></div>';
  var pend = pendingItems();
  h += '<div class="pcard"><h2>' + ic('chat') + 'Customer replies · simulated</h2>';
  h += pend.length ? pend.map(function (x) { var c = custOf(x.j); return '<div class="sim"><div class="small"><b>' + esc(c.name) + '</b> got: “Your OK needed: ' + esc(x.it.name) + ' ' + fmt(x.it.price) + '”</div><div class="row"><button class="sbtn" data-a="decide" data-j="' + x.j.id + '" data-i="' + x.it.id + '" data-v="yes">' + ic('check') + 'Yes</button><button class="sbtn" data-a="decide" data-j="' + x.j.id + '" data-i="' + x.it.id + '" data-v="no">' + ic('close') + 'No</button></div></div>'; }).join('') : '<p>The customer side isn’t designed yet. When a part needs approval, answer for the customer here.</p>';
  h += '</div>';
  h += '<div class="pcard"><h2>' + ic('send') + 'Sent on WhatsApp</h2><div class="wa-log">' + S.sent.slice(0, 12).map(function (m) { var to = m.to ? S.customers[m.to].name : 'Broadcast'; return '<div class="wa-msg"><div class="to"><span>To ' + esc(to) + '</span><span>' + m.t + '</span></div>' + esc(m.text) + '</div>'; }).join('') + '</div></div>';
  return h;
}

/* ---------- render ---------- */
var VIEWS = { track: vTrack, scan: vScan, job: vJob, vehicles: vVehicles, vehicle: vVehicle, stock: vStock, hisaab: vHisaab, settings: vSettings, onboard: vOnboard, broadcast: vBroadcast, poster: vPoster };
function render() {
  var ae = document.activeElement, fid = ae && ae.id, sel = fid && ae.selectionStart;
  var bodyEl = document.querySelector('#app .body'), keepScroll = bodyEl && render.lastView === S.view + S.jobId + S.vehId ? bodyEl.scrollTop : 0;
  var dark = S.view === 'scan' || (S.view === 'onboard' && S.ob && S.ob.step === 1);
  $('app').innerHTML = '<div class="sbar" style="' + (dark ? 'background:var(--cam);color:#fff' : '') + '"><span>' + nowStr().replace(/ [ap]m/, '') + '</span><span>' + ic('signal_cellular_alt') + ' ' + ic('battery_5_bar') + '</span></div>' +
    VIEWS[S.view]() + (S.snack ? '<div class="snack" role="status">' + esc(S.snack) + '</div>' : '') + sheetHTML();
  $('panel').innerHTML = panelHTML();
  var nb = document.querySelector('#app .body'); if (nb && keepScroll) nb.scrollTop = keepScroll;
  render.lastView = S.view + S.jobId + S.vehId;
  if (fid) { var el = $(fid); if (el && el.tagName === 'INPUT') { el.focus(); try { el.setSelectionRange(sel, sel); } catch (e) {} } }
}
function init() {
  S = seedState();
  var j1 = { id: 'J1', plate: 'MH 39 AB 4521', status: 'ticket', via: 'whatsapp', said: 'Scooty se khat-khat awaaz aa rahi hai, brake bhi dheela lag raha hai.', saidAt: '2:40 pm', likely: ['reg', 'brake'], items: [], services: [], mech: null, eta: null };
  var j2 = mkJob('MH 39 R 2210', 'walkin'); ['reg', 'wash'].forEach(function (k) { addSvc(j2, k, 'inspection'); }); j2.status = 'estimated'; j2.mech = 'Ajay'; j2.eta = 'By 5 pm';
  var j3 = mkJob('MH 39 K 8812', 'walkin'); addSvc(j3, 'reg', 'inspection'); j3.status = 'inwork'; j3.mech = 'Ajay'; j3.eta = 'By 5 pm'; j3.startedAt = '3:20 pm';
  var j4 = mkJob('MH 39 C 1190', 'walkin'); addSvc(j4, 'punct', 'inspection'); addSvc(j4, 'chain', 'inspection'); j4.items.push(item('Spark plug', 120, 'part', 'inspection', 'sparkPlug'));
  j4.items.forEach(function (i) { i.deducted = true; }); j4.status = 'ready'; j4.mech = 'Ajay'; j4.billNo = 'G-1042'; j4.doneAt = '3:55 pm';
  S.jobs = [j1, j2, j3, j4];
}
A.obFill = function () { S.ob.name = 'Vikas Gavit'; S.ob.phone = '93250 18874'; S.ob.model = 'Hero HF Deluxe'; S.ob.km = '15200'; render(); };

document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  var fn = A[b.dataset.a]; if (fn) { e.preventDefault(); fn(b.dataset, b); }
});
document.addEventListener('submit', function (e) {
  e.preventDefault(); var f = e.target;
  if (f.id === 'manual') handlePlate(f.querySelector('input').value);
  if (f.id === 'obplate') obSetPlate(f.querySelector('input').value);
});
document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'vsearch') { S.search = t.value; render(); }
  if (t.dataset && t.dataset.ob && S.ob) S.ob[t.dataset.ob] = t.value;
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet) { S.sheet = null; render(); } });
init(); render();
