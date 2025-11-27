import { defineComponent as fe, ref as p, computed as P, watch as m, nextTick as I, onMounted as de, onBeforeUnmount as ve, createElementBlock as G, openBlock as U, normalizeStyle as J, createElementVNode as K, createCommentVNode as pe, normalizeClass as L } from "vue";
const ge = ["width", "height", "aria-label"], Q = "#27ae60", me = "#c0392b", he = "#2c3e50", be = /* @__PURE__ */ fe({
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
      default: (f) => 1 - Math.pow(1 - f, 4)
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
  setup(f, { expose: O, emit: T }) {
    const y = ["#f39c12", "#8e44ad", "#16a085", "#d35400"], n = f, S = T, W = p(null), s = p(n.initialAngle), b = p(!1), x = p(null), r = p({
      startAngle: n.initialAngle,
      endAngle: n.initialAngle,
      duration: n.spinDuration,
      startTime: 0
    }), z = p(null), A = p(null), C = p(null), k = p(!1), D = P(() => ({
      visible: !0,
      color: "#ffffff",
      width: 26,
      length: 38,
      ...n.pointerOptions ?? {}
    })), X = P(() => D.value.visible !== !1), Y = P(() => {
      const { width: t, length: e, color: l } = D.value, a = {
        "--pointer-width": `${t}px`,
        "--pointer-length": `${e}px`,
        "--pointer-color": l ?? "#ffffff"
      }, o = `${-(e / 2)}px`;
      switch (n.pointerPosition) {
        case "bottom":
          return { ...a, bottom: o, left: "50%", transform: "translate(-50%, 0)" };
        case "left":
          return { ...a, left: o, top: "50%", transform: "translate(0, -50%)" };
        case "right":
          return { ...a, right: o, top: "50%", transform: "translate(0, -50%)" };
        case "top":
        default:
          return { ...a, top: o, left: "50%", transform: "translate(-50%, 0)" };
      }
    }), i = P(() => {
      const t = !n.useColor && n.items.length % 2 === 1;
      return (t ? [{ label: "0", value: "0", color: Q }, ...n.items] : [...n.items]).map((l, a) => {
        if (n.useColor) {
          const u = y.length ? a % y.length : 0, g = y[u] ?? "#ffffff", c = l.color ?? g;
          return { label: l.label, value: l.value, color: c };
        }
        if (t && a === 0)
          return { label: l.label, value: l.value, color: Q };
        const v = (t ? a - 1 : a) % 2 === 0 ? me : he;
        return { label: l.label, value: l.value, color: v };
      });
    }), B = P(() => i.value.length ? 360 / i.value.length : 0), R = (t) => {
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
      if (!i.value.length)
        return null;
      const e = Z(), l = t + e, a = R(l), o = B.value, v = o / 2, g = (360 - (a - v + 360) % 360) % 360;
      let c = Math.floor(g / o);
      return c >= i.value.length && (c = i.value.length - 1), c;
    }, $ = () => {
      const t = h(s.value);
      return t === null ? null : i.value[t] ?? null;
    }, ee = () => {
      if (!n.enableTickSound || typeof window > "u")
        return;
      C.value || (C.value = new AudioContext());
      const t = C.value;
      if (!t)
        return;
      t.state === "suspended" && t.resume();
      const e = t.createOscillator(), l = t.createGain(), a = Math.max(0, Math.min(1, n.tickSoundVolume));
      e.frequency.value = 1200, l.gain.value = a, e.connect(l), l.connect(t.destination);
      const o = t.currentTime;
      l.gain.setValueAtTime(a, o), l.gain.exponentialRampToValueAtTime(1e-4, o + 0.02), e.start(o), e.stop(o + 0.02);
    }, te = () => {
      const t = h(s.value);
      t !== null && A.value !== t && (A.value = t, ee());
    }, N = () => {
      S("update:angle", R(s.value));
    }, ne = (t) => {
      let e = t.replace("#", "");
      e.length === 3 && (e = e.split("").map((u) => u + u).join(""));
      const l = parseInt(e.substring(0, 2), 16), a = parseInt(e.substring(2, 4), 16), o = parseInt(e.substring(4, 6), 16);
      return (0.299 * l + 0.587 * a + 0.114 * o) / 255 > 0.5 ? "#000000" : "#ffffff";
    }, d = () => {
      const t = W.value;
      if (!t)
        return;
      const e = t.getContext("2d");
      if (!e)
        return;
      const l = n.size, a = l / 2, o = a * n.centerHoleRatio;
      e.clearRect(0, 0, l, l), e.save(), e.translate(a, a);
      const v = i.value.length, u = n.borderWidth ?? 4;
      if (!v) {
        const M = a - u / 2;
        e.beginPath(), e.arc(0, 0, M, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, o, 0, Math.PI * 2), e.fill(), e.restore(), e.beginPath(), e.arc(0, 0, o, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.restore();
        return;
      }
      const g = 2 * Math.PI / v, c = s.value * Math.PI / 180, ue = -Math.PI / 2 - g / 2, V = a - u / 2;
      i.value.forEach((M, ce) => {
        const F = c + ce * g + ue, _ = F + g;
        e.beginPath(), e.moveTo(0, 0), e.fillStyle = M.color, e.arc(0, 0, V, F, _), e.closePath(), e.fill(), e.save(), e.fillStyle = ne(M.color), e.rotate((F + _) / 2), e.textAlign = "right", e.font = `${Math.max(14, a * 0.08)}px sans-serif`, e.fillText(M.label, V - 20, 6), e.restore();
      }), u > 0 && (e.beginPath(), e.arc(0, 0, V, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, o, 0, Math.PI * 2), e.fill(), e.restore(), u > 0 && (e.beginPath(), e.arc(0, 0, o, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.restore();
    }, w = () => {
      x.value !== null && (cancelAnimationFrame(x.value), x.value = null);
    }, ae = () => {
      w(), x.value = requestAnimationFrame(j);
    }, j = (t) => {
      r.value.startTime || (r.value.startTime = t);
      const e = t - r.value.startTime, l = r.value.duration || 1, a = Math.min(e / l, 1), o = n.easingFunction(a);
      s.value = r.value.startAngle + (r.value.endAngle - r.value.startAngle) * o, N(), te(), d(), a < 1 ? x.value = requestAnimationFrame(j) : le();
    }, le = () => {
      w(), b.value = !1, k.value = !1, N(), d(), S("spin-end");
      const t = $();
      z.value = t, t && S("select", t);
    }, oe = () => {
      const t = Math.floor(n.initialVelocity * n.spinDuration / 36e4);
      return Math.max(3, t) + Math.floor(Math.random() * 3);
    }, q = () => {
      if (i.value.length <= 1)
        return 0.5;
      const t = 0.04;
      return t + Math.random() * (1 - t * 2);
    }, E = (t, e, l = 0.5) => {
      if (!i.value.length)
        return s.value;
      const a = B.value, o = R(s.value), v = Math.min(Math.max(l, 0.01), 0.99), u = a / 2;
      let c = (360 - (t + v) * a + u) % 360 - o;
      return c <= 0 && (c += 360), c += e * 360, s.value + c;
    }, H = () => {
      if (!i.value.length || b.value)
        return;
      k.value = !1;
      const t = Math.floor(Math.random() * i.value.length), e = i.value[t];
      e && (z.value = e, r.value.startAngle = s.value, r.value.endAngle = E(t, oe(), q()), r.value.duration = n.spinDuration, r.value.startTime = 0, b.value = !0, S("spin-start"), ae());
    }, re = () => {
      if (!b.value || k.value)
        return;
      k.value = !0;
      const t = h(s.value);
      if (t === null)
        return;
      const e = i.value[t];
      e && (z.value = e, r.value.startAngle = s.value, r.value.endAngle = E(t, 1, q()), r.value.duration = Math.min(n.spinDuration / 2, 1e3), r.value.startTime = 0);
    }, se = () => {
      w(), b.value = !1, k.value = !1, z.value = null, s.value = n.initialAngle, r.value = {
        startAngle: n.initialAngle,
        endAngle: n.initialAngle,
        duration: n.spinDuration,
        startTime: 0
      }, N(), d(), A.value = h(s.value);
    }, ie = () => {
      n.spinOnClick && H();
    };
    return m(
      () => n.size,
      () => {
        I(d);
      }
    ), m(
      () => n.centerHoleRatio,
      () => {
        I(d);
      }
    ), m(
      () => n.borderWidth,
      () => {
        I(d);
      }
    ), m(
      () => n.borderColor,
      () => {
        I(d);
      }
    ), m(
      () => n.pointerPosition,
      () => {
        A.value = h(s.value);
      }
    ), m(
      () => n.initialAngle,
      (t) => {
        b.value || (s.value = t, r.value.startAngle = t, r.value.endAngle = t, r.value.startTime = 0, d());
      }
    ), m(
      () => n.spinDuration,
      (t) => {
        r.value.duration = t;
      }
    ), m(i, () => {
      I(() => {
        A.value = h(s.value), d();
      });
    }), de(() => {
      d(), A.value = h(s.value);
    }), ve(() => {
      w(), C.value && C.value.close();
    }), O({
      spin: H,
      stop: re,
      reset: se,
      getCurrentItem: $
    }), (t, e) => (U(), G("div", {
      class: "casino-roulette",
      style: J({ width: f.size + "px", height: f.size + "px" })
    }, [
      K("canvas", {
        ref_key: "canvasRef",
        ref: W,
        class: L(["roulette-canvas", { clickable: f.spinOnClick }]),
        width: f.size,
        height: f.size,
        "aria-label": `Roulette avec ${i.value.length} sections`,
        onClick: ie
      }, null, 10, ge),
      X.value ? (U(), G("div", {
        key: 0,
        class: L(["roulette-pointer", `pointer-${n.pointerPosition}`]),
        style: J(Y.value)
      }, [...e[0] || (e[0] = [
        K("div", { class: "pointer-shape" }, null, -1)
      ])], 6)) : pe("", !0)
    ], 4));
  }
}), Ae = (f, O) => {
  const T = f.__vccOpts || f;
  for (const [y, n] of O)
    T[y] = n;
  return T;
}, xe = /* @__PURE__ */ Ae(be, [["__scopeId", "data-v-8ca3b7dc"]]);
export {
  xe as VueRoulette,
  xe as default
};
