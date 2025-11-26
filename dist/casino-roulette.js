import { defineComponent as oe, ref as f, computed as M, watch as z, nextTick as j, onMounted as re, onBeforeUnmount as se, createElementBlock as E, openBlock as G, normalizeStyle as U, createElementVNode as H, createCommentVNode as ie, normalizeClass as ue } from "vue";
const ce = ["width", "height", "aria-label"], J = "#27ae60", fe = "#c0392b", ve = "#2c3e50", de = 0.28, ge = /* @__PURE__ */ oe({
  __name: "CasinoRoulette",
  props: {
    items: {
      type: Array,
      required: !0
    },
    size: {
      type: Number,
      default: 400
    },
    spinDuration: {
      type: Number,
      default: 4e3
    },
    easingFunction: {
      type: Function,
      default: (c) => 1 - Math.pow(1 - c, 4)
    },
    useColor: {
      type: Boolean,
      default: !1
    },
    initialVelocity: {
      type: Number,
      default: 2e3
    },
    initialAngle: {
      type: Number,
      default: 0
    },
    enableTickSound: {
      type: Boolean,
      default: !1
    },
    pointerOptions: {
      type: Object,
      default: () => ({})
    },
    pointerPosition: {
      type: String,
      default: "top"
    }
  },
  emits: ["spin-start", "spin-end", "select", "update:angle"],
  setup(c, { expose: S, emit: k }) {
    const h = ["#f39c12", "#8e44ad", "#16a085", "#d35400"], a = c, C = k, F = f(null), r = f(a.initialAngle), m = f(!1), b = f(null), o = f({
      startAngle: a.initialAngle,
      endAngle: a.initialAngle,
      duration: a.spinDuration,
      startTime: 0
    }), I = f(null), A = f(null), x = f(null), y = f(!1), N = M(() => ({
      visible: !0,
      color: "#ffffff",
      width: 26,
      length: 38,
      ...a.pointerOptions ?? {}
    })), K = M(() => N.value.visible !== !1), L = M(() => {
      const { width: t, length: e, color: l } = N.value, n = {
        "--pointer-width": `${t}px`,
        "--pointer-length": `${e}px`,
        "--pointer-color": l ?? "#ffffff"
      }, i = `${-(e / 2)}px`;
      switch (a.pointerPosition) {
        case "bottom":
          return { ...n, bottom: i, left: "50%", transform: "translate(-50%, 0)" };
        case "left":
          return { ...n, left: i, top: "50%", transform: "translate(0, -50%)" };
        case "right":
          return { ...n, right: i, top: "50%", transform: "translate(0, -50%)" };
        case "top":
        default:
          return { ...n, top: i, left: "50%", transform: "translate(-50%, 0)" };
      }
    }), s = M(() => {
      const t = !a.useColor && a.items.length % 2 === 1;
      return (t ? [{ label: "0", value: "0", color: J }, ...a.items] : [...a.items]).map((l, n) => {
        if (a.useColor) {
          const u = h.length ? n % h.length : 0, T = h[u] ?? "#ffffff", d = l.color ?? T;
          return { label: l.label, value: l.value, color: d };
        }
        if (t && n === 0)
          return { label: l.label, value: l.value, color: J };
        const v = (t ? n - 1 : n) % 2 === 0 ? fe : ve;
        return { label: l.label, value: l.value, color: v };
      });
    }), D = M(() => s.value.length ? 360 / s.value.length : 0), w = (t) => {
      const e = t % 360;
      return e >= 0 ? e : e + 360;
    }, p = (t) => {
      if (!s.value.length)
        return null;
      const e = w(t), l = D.value, n = l / 2, v = (360 - (e - n + 360) % 360) % 360;
      let u = Math.floor(v / l);
      return u >= s.value.length && (u = s.value.length - 1), u;
    }, V = () => {
      const t = p(r.value);
      return t === null ? null : s.value[t] ?? null;
    }, Q = () => {
      if (!a.enableTickSound || typeof window > "u")
        return;
      x.value || (x.value = new AudioContext());
      const t = x.value;
      if (!t)
        return;
      t.state === "suspended" && t.resume();
      const e = t.createOscillator(), l = t.createGain();
      e.frequency.value = 1200, l.gain.value = 15e-4, e.connect(l), l.connect(t.destination);
      const n = t.currentTime;
      l.gain.setValueAtTime(15e-4, n), l.gain.exponentialRampToValueAtTime(1e-5, n + 0.02), e.start(n), e.stop(n + 0.02);
    }, X = () => {
      const t = p(r.value);
      t !== null && A.value !== t && (A.value = t, Q());
    }, O = () => {
      C("update:angle", w(r.value));
    }, g = () => {
      const t = F.value;
      if (!t)
        return;
      const e = t.getContext("2d");
      if (!e)
        return;
      const l = a.size, n = l / 2, i = n * de;
      e.clearRect(0, 0, l, l), e.save(), e.translate(n, n);
      const v = s.value.length;
      if (!v) {
        e.beginPath(), e.arc(0, 0, n - 8, 0, Math.PI * 2), e.strokeStyle = "#d6d6d6", e.lineWidth = 4, e.stroke(), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, i, 0, Math.PI * 2), e.fill(), e.restore(), e.beginPath(), e.arc(0, 0, i, 0, Math.PI * 2), e.strokeStyle = "rgba(255, 255, 255, 0.35)", e.lineWidth = Math.max(2, n * 0.012), e.stroke(), e.restore();
        return;
      }
      const u = 2 * Math.PI / v, T = r.value * Math.PI / 180, d = -Math.PI / 2 - u / 2;
      s.value.forEach((_, le) => {
        const R = T + le * u + d, W = R + u;
        e.beginPath(), e.moveTo(0, 0), e.fillStyle = _.color, e.arc(0, 0, n - 4, R, W), e.closePath(), e.fill(), e.save(), e.fillStyle = "#ffffff", e.rotate((R + W) / 2), e.textAlign = "right", e.font = `${Math.max(14, n * 0.08)}px sans-serif`, e.fillText(_.label, n - 24, 6), e.restore();
      }), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, i, 0, Math.PI * 2), e.fill(), e.restore(), e.beginPath(), e.arc(0, 0, i, 0, Math.PI * 2), e.strokeStyle = "rgba(255, 255, 255, 0.35)", e.lineWidth = Math.max(2, n * 0.012), e.stroke(), e.restore();
    }, P = () => {
      b.value !== null && (cancelAnimationFrame(b.value), b.value = null);
    }, Y = () => {
      P(), b.value = requestAnimationFrame(B);
    }, B = (t) => {
      o.value.startTime || (o.value.startTime = t);
      const e = t - o.value.startTime, l = o.value.duration || 1, n = Math.min(e / l, 1), i = a.easingFunction(n);
      r.value = o.value.startAngle + (o.value.endAngle - o.value.startAngle) * i, O(), X(), g(), n < 1 ? b.value = requestAnimationFrame(B) : Z();
    }, Z = () => {
      P(), m.value = !1, y.value = !1, O(), g(), C("spin-end");
      const t = V();
      I.value = t, t && C("select", t);
    }, ee = () => {
      const t = Math.floor(a.initialVelocity * a.spinDuration / 36e4);
      return Math.max(3, t) + Math.floor(Math.random() * 3);
    }, $ = () => {
      if (s.value.length <= 1)
        return 0.5;
      const t = 0.04;
      return t + Math.random() * (1 - t * 2);
    }, q = (t, e, l = 0.5) => {
      if (!s.value.length)
        return r.value;
      const n = D.value, i = w(r.value), v = Math.min(Math.max(l, 0.01), 0.99), u = n / 2;
      let d = (360 - (t + v) * n + u) % 360 - i;
      return d <= 0 && (d += 360), d += e * 360, r.value + d;
    }, te = () => {
      if (!s.value.length || m.value)
        return;
      y.value = !1;
      const t = Math.floor(Math.random() * s.value.length), e = s.value[t];
      e && (I.value = e, o.value.startAngle = r.value, o.value.endAngle = q(t, ee(), $()), o.value.duration = a.spinDuration, o.value.startTime = 0, m.value = !0, C("spin-start"), Y());
    }, ne = () => {
      if (!m.value || y.value)
        return;
      y.value = !0;
      const t = p(r.value);
      if (t === null)
        return;
      const e = s.value[t];
      e && (I.value = e, o.value.startAngle = r.value, o.value.endAngle = q(t, 1, $()), o.value.duration = Math.min(a.spinDuration / 2, 1e3), o.value.startTime = 0);
    }, ae = () => {
      P(), m.value = !1, y.value = !1, I.value = null, r.value = a.initialAngle, o.value = {
        startAngle: a.initialAngle,
        endAngle: a.initialAngle,
        duration: a.spinDuration,
        startTime: 0
      }, O(), g(), A.value = p(r.value);
    };
    return z(
      () => a.size,
      () => {
        j(g);
      }
    ), z(
      () => a.initialAngle,
      (t) => {
        m.value || (r.value = t, o.value.startAngle = t, o.value.endAngle = t, o.value.startTime = 0, g());
      }
    ), z(
      () => a.spinDuration,
      (t) => {
        o.value.duration = t;
      }
    ), z(s, () => {
      j(() => {
        A.value = p(r.value), g();
      });
    }), re(() => {
      g(), A.value = p(r.value);
    }), se(() => {
      P(), x.value && x.value.close();
    }), S({
      spin: te,
      stop: ne,
      reset: ae,
      getCurrentItem: V
    }), (t, e) => (G(), E("div", {
      class: "casino-roulette",
      style: U({ width: c.size + "px", height: c.size + "px" })
    }, [
      H("canvas", {
        ref_key: "canvasRef",
        ref: F,
        class: "roulette-canvas",
        width: c.size,
        height: c.size,
        "aria-label": `Roulette avec ${s.value.length} sections`
      }, null, 8, ce),
      K.value ? (G(), E("div", {
        key: 0,
        class: ue(["roulette-pointer", `pointer-${a.pointerPosition}`]),
        style: U(L.value)
      }, [...e[0] || (e[0] = [
        H("div", { class: "pointer-shape" }, null, -1)
      ])], 6)) : ie("", !0)
    ], 4));
  }
}), me = (c, S) => {
  const k = c.__vccOpts || c;
  for (const [h, a] of S)
    k[h] = a;
  return k;
}, he = /* @__PURE__ */ me(ge, [["__scopeId", "data-v-1793a31e"]]);
export {
  he as CasinoRoulette,
  he as default
};
