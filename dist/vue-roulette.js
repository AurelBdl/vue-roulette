import { defineComponent as ce, ref as v, computed as M, watch as m, nextTick as P, onMounted as fe, onBeforeUnmount as de, createElementBlock as H, openBlock as G, normalizeStyle as U, createElementVNode as J, createCommentVNode as ve, normalizeClass as K } from "vue";
const ge = ["width", "height", "aria-label"], pe = "#27ae60", me = "#c0392b", he = "#2c3e50", Ae = /* @__PURE__ */ ce({
  __name: "VueRoulette",
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
      default: (g) => 1 - Math.pow(1 - g, 4)
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
    },
    centerHoleRatio: {
      type: Number,
      default: 0.28
    },
    spinOnClick: {
      type: Boolean,
      default: !1
    },
    tickSoundVolume: {
      type: Number,
      default: 0.15
    },
    borderWidth: {
      type: Number,
      default: 4
    },
    borderColor: {
      type: String,
      default: "#ffffff"
    }
  },
  emits: ["spin-start", "spin-end", "select", "update:angle"],
  setup(g, { expose: L, emit: Q }) {
    const z = ["#f39c12", "#8e44ad", "#16a085", "#d35400"], n = g, I = Q, V = v(null), i = v(n.initialAngle), b = v(!1), y = v(null), r = v({
      startAngle: n.initialAngle,
      endAngle: n.initialAngle,
      duration: n.spinDuration,
      startTime: 0
    }), T = v(null), A = v(null), x = v(null), C = v(!1), F = M(() => ({
      visible: !0,
      color: "#ffffff",
      width: 26,
      length: 38,
      ...n.pointerOptions ?? {}
    })), X = M(() => F.value.visible !== !1), Y = M(() => {
      const { width: t, length: e, color: o } = F.value, a = {
        "--pointer-width": `${t}px`,
        "--pointer-length": `${e}px`,
        "--pointer-color": o ?? "#ffffff"
      }, l = `${-(e / 2)}px`;
      switch (n.pointerPosition) {
        case "bottom":
          return { ...a, bottom: l, left: "50%", transform: "translate(-50%, 0)" };
        case "left":
          return { ...a, left: l, top: "50%", transform: "translate(0, -50%)" };
        case "right":
          return { ...a, right: l, top: "50%", transform: "translate(0, -50%)" };
        case "top":
        default:
          return { ...a, top: l, left: "50%", transform: "translate(-50%, 0)" };
      }
    }), s = M(() => {
      const t = !n.useColor && n.items.length % 2 === 1;
      return n.items.map((e, o) => {
        if (n.useColor) {
          const d = z.length ? o % z.length : 0, u = z[d] ?? "#ffffff", p = e.color ?? u;
          return { label: e.label, value: e.value, color: p };
        }
        if (t && o === 0)
          return { label: e.label, value: e.value, color: pe };
        const l = (t ? o - 1 : o) % 2 === 0 ? me : he;
        return { label: e.label, value: e.value, color: l };
      });
    }), W = M(() => s.value.length ? 360 / s.value.length : 0), w = (t) => {
      const e = t % 360;
      return e >= 0 ? e : e + 360;
    }, Z = () => {
      switch (n.pointerPosition) {
        case "right":
          return -90;
        case "bottom":
          return 180;
        case "left":
          return 90;
        case "top":
        default:
          return 0;
      }
    }, h = (t) => {
      if (!s.value.length)
        return null;
      const e = Z(), o = t + e, a = w(o), l = W.value, d = l / 2, p = (360 - (a - d + 360) % 360) % 360;
      let f = Math.floor(p / l);
      return f >= s.value.length && (f = s.value.length - 1), f;
    }, D = () => {
      const t = h(i.value);
      return t === null ? null : s.value[t] ?? null;
    }, _ = () => {
      if (!n.enableTickSound || typeof window > "u")
        return;
      x.value || (x.value = new AudioContext());
      const t = x.value;
      if (!t)
        return;
      t.state === "suspended" && t.resume();
      const e = t.createOscillator(), o = t.createGain(), a = Math.max(0, Math.min(1, n.tickSoundVolume));
      e.frequency.value = 1200, o.gain.value = a, e.connect(o), o.connect(t.destination);
      const l = t.currentTime;
      o.gain.setValueAtTime(a, l), o.gain.exponentialRampToValueAtTime(1e-4, l + 0.02), e.start(l), e.stop(l + 0.02);
    }, ee = () => {
      const t = h(i.value);
      t !== null && A.value !== t && (A.value = t, _());
    }, O = () => {
      I("update:angle", w(i.value));
    }, te = (t) => {
      let e = t.replace("#", "");
      e.length === 3 && (e = e.split("").map((u) => u + u).join(""));
      const o = parseInt(e.substring(0, 2), 16), a = parseInt(e.substring(2, 4), 16), l = parseInt(e.substring(4, 6), 16);
      return (0.299 * o + 0.587 * a + 0.114 * l) / 255 > 0.5 ? "#000000" : "#ffffff";
    }, c = () => {
      const t = V.value;
      if (!t)
        return;
      const e = t.getContext("2d");
      if (!e)
        return;
      const o = n.size, a = o / 2, l = a * n.centerHoleRatio;
      e.clearRect(0, 0, o, o), e.save(), e.translate(a, a);
      const d = s.value.length, u = n.borderWidth ?? 4;
      if (!d) {
        const k = a - u / 2;
        e.beginPath(), e.arc(0, 0, k, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.fill(), e.restore(), e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.restore();
        return;
      }
      const p = 2 * Math.PI / d, f = i.value * Math.PI / 180, se = -Math.PI / 2 - p / 2, R = a - u / 2;
      s.value.forEach((k, ue) => {
        const N = f + ue * p + se, E = N + p;
        e.beginPath(), e.moveTo(0, 0), e.fillStyle = k.color, e.arc(0, 0, R, N, E), e.closePath(), e.fill(), e.save(), e.fillStyle = te(k.color), e.rotate((N + E) / 2), e.textAlign = "right", e.font = `${Math.max(14, a * 0.08)}px sans-serif`, e.fillText(k.label, R - 20, 6), e.restore();
      }), u > 0 && (e.beginPath(), e.arc(0, 0, R, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.fill(), e.restore(), u > 0 && (e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.restore();
    }, S = () => {
      y.value !== null && (cancelAnimationFrame(y.value), y.value = null);
    }, ne = () => {
      S(), y.value = requestAnimationFrame(B);
    }, B = (t) => {
      r.value.startTime || (r.value.startTime = t);
      const e = t - r.value.startTime, o = r.value.duration || 1, a = Math.min(e / o, 1), l = n.easingFunction(a);
      i.value = r.value.startAngle + (r.value.endAngle - r.value.startAngle) * l, O(), ee(), c(), a < 1 ? y.value = requestAnimationFrame(B) : ae();
    }, ae = () => {
      S(), b.value = !1, C.value = !1, O(), c(), I("spin-end");
      const t = D();
      T.value = t, t && I("select", t);
    }, le = () => {
      const t = Math.floor(n.initialVelocity * n.spinDuration / 36e4);
      return Math.max(3, t) + Math.floor(Math.random() * 3);
    }, $ = () => {
      if (s.value.length <= 1)
        return 0.5;
      const t = 0.04;
      return t + Math.random() * (1 - t * 2);
    }, j = (t, e, o = 0.5) => {
      if (!s.value.length)
        return i.value;
      const a = W.value, l = w(i.value), d = Math.min(Math.max(o, 0.01), 0.99), u = a / 2;
      let f = (360 - (t + d) * a + u) % 360 - l;
      return f <= 0 && (f += 360), f += e * 360, i.value + f;
    }, q = () => {
      if (!s.value.length || b.value)
        return;
      C.value = !1;
      const t = Math.floor(Math.random() * s.value.length), e = s.value[t];
      e && (T.value = e, r.value.startAngle = i.value, r.value.endAngle = j(t, le(), $()), r.value.duration = n.spinDuration, r.value.startTime = 0, b.value = !0, I("spin-start"), ne());
    }, oe = () => {
      if (!b.value || C.value)
        return;
      C.value = !0;
      const t = h(i.value);
      if (t === null)
        return;
      const e = s.value[t];
      e && (T.value = e, r.value.startAngle = i.value, r.value.endAngle = j(t, 1, $()), r.value.duration = Math.min(n.spinDuration / 2, 1e3), r.value.startTime = 0);
    }, re = () => {
      S(), b.value = !1, C.value = !1, T.value = null, i.value = n.initialAngle, r.value = {
        startAngle: n.initialAngle,
        endAngle: n.initialAngle,
        duration: n.spinDuration,
        startTime: 0
      }, O(), c(), A.value = h(i.value);
    }, ie = () => {
      n.spinOnClick && q();
    };
    return m(
      () => n.size,
      () => {
        P(c);
      }
    ), m(
      () => n.centerHoleRatio,
      () => {
        P(c);
      }
    ), m(
      () => n.borderWidth,
      () => {
        P(c);
      }
    ), m(
      () => n.borderColor,
      () => {
        P(c);
      }
    ), m(
      () => n.pointerPosition,
      () => {
        A.value = h(i.value);
      }
    ), m(
      () => n.initialAngle,
      (t) => {
        b.value || (i.value = t, r.value.startAngle = t, r.value.endAngle = t, r.value.startTime = 0, c());
      }
    ), m(
      () => n.spinDuration,
      (t) => {
        r.value.duration = t;
      }
    ), m(s, () => {
      P(() => {
        A.value = h(i.value), c();
      });
    }), fe(() => {
      c(), A.value = h(i.value);
    }), de(() => {
      S(), x.value && x.value.close();
    }), L({
      spin: q,
      stop: oe,
      reset: re,
      getCurrentItem: D
    }), (t, e) => (G(), H("div", {
      class: "casino-roulette",
      style: U({ width: g.size + "px", height: g.size + "px" })
    }, [
      J("canvas", {
        ref_key: "canvasRef",
        ref: V,
        class: K(["roulette-canvas", { clickable: g.spinOnClick }]),
        width: g.size,
        height: g.size,
        "aria-label": `Roulette avec ${s.value.length} sections`,
        onClick: ie
      }, null, 10, ge),
      X.value ? (G(), H("div", {
        key: 0,
        class: K(["roulette-pointer", `pointer-${n.pointerPosition}`]),
        style: U(Y.value)
      }, [...e[0] || (e[0] = [
        J("div", { class: "pointer-shape" }, null, -1)
      ])], 6)) : ve("", !0)
    ], 4));
  }
});
export {
  Ae as VueRoulette,
  Ae as default
};
