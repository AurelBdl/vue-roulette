import { defineComponent as ce, ref as p, computed as P, watch as m, nextTick as I, onMounted as fe, onBeforeUnmount as de, createElementBlock as G, openBlock as U, normalizeStyle as J, createElementVNode as K, createCommentVNode as ve, normalizeClass as L } from "vue";
const pe = ["width", "height", "aria-label"], ge = "#27ae60", me = "#c0392b", he = "#2c3e50", be = /* @__PURE__ */ ce({
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
  setup(c, { expose: O, emit: T }) {
    const y = ["#f39c12", "#8e44ad", "#16a085", "#d35400"], n = c, S = T, W = p(null), i = p(n.initialAngle), b = p(!1), x = p(null), r = p({
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
    })), Q = P(() => D.value.visible !== !1), X = P(() => {
      const { width: t, length: e, color: o } = D.value, a = {
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
    }), s = P(() => {
      const t = !n.useColor && n.items.length % 2 === 1;
      return n.items.map((e, o) => {
        if (n.useColor) {
          const v = y.length ? o % y.length : 0, u = y[v] ?? "#ffffff", g = e.color ?? u;
          return { label: e.label, value: e.value, color: g };
        }
        if (t && o === 0)
          return { label: e.label, value: e.value, color: ge };
        const l = (t ? o - 1 : o) % 2 === 0 ? me : he;
        return { label: e.label, value: e.value, color: l };
      });
    }), B = P(() => s.value.length ? 360 / s.value.length : 0), R = (t) => {
      const e = t % 360;
      return e >= 0 ? e : e + 360;
    }, Y = () => {
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
      const e = Y(), o = t + e, a = R(o), l = B.value, v = l / 2, g = (360 - (a - v + 360) % 360) % 360;
      let d = Math.floor(g / l);
      return d >= s.value.length && (d = s.value.length - 1), d;
    }, $ = () => {
      const t = h(i.value);
      return t === null ? null : s.value[t] ?? null;
    }, Z = () => {
      if (!n.enableTickSound || typeof window > "u")
        return;
      C.value || (C.value = new AudioContext());
      const t = C.value;
      if (!t)
        return;
      t.state === "suspended" && t.resume();
      const e = t.createOscillator(), o = t.createGain(), a = Math.max(0, Math.min(1, n.tickSoundVolume));
      e.frequency.value = 1200, o.gain.value = a, e.connect(o), o.connect(t.destination);
      const l = t.currentTime;
      o.gain.setValueAtTime(a, l), o.gain.exponentialRampToValueAtTime(1e-4, l + 0.02), e.start(l), e.stop(l + 0.02);
    }, ee = () => {
      const t = h(i.value);
      t !== null && A.value !== t && (A.value = t, Z());
    }, N = () => {
      S("update:angle", R(i.value));
    }, te = (t) => {
      let e = t.replace("#", "");
      e.length === 3 && (e = e.split("").map((u) => u + u).join(""));
      const o = parseInt(e.substring(0, 2), 16), a = parseInt(e.substring(2, 4), 16), l = parseInt(e.substring(4, 6), 16);
      return (0.299 * o + 0.587 * a + 0.114 * l) / 255 > 0.5 ? "#000000" : "#ffffff";
    }, f = () => {
      const t = W.value;
      if (!t)
        return;
      const e = t.getContext("2d");
      if (!e)
        return;
      const o = n.size, a = o / 2, l = a * n.centerHoleRatio;
      e.clearRect(0, 0, o, o), e.save(), e.translate(a, a);
      const v = s.value.length, u = n.borderWidth ?? 4;
      if (!v) {
        const M = a - u / 2;
        e.beginPath(), e.arc(0, 0, M, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.fill(), e.restore(), e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke(), e.restore();
        return;
      }
      const g = 2 * Math.PI / v, d = i.value * Math.PI / 180, se = -Math.PI / 2 - g / 2, V = a - u / 2;
      s.value.forEach((M, ue) => {
        const F = d + ue * g + se, _ = F + g;
        e.beginPath(), e.moveTo(0, 0), e.fillStyle = M.color, e.arc(0, 0, V, F, _), e.closePath(), e.fill(), e.save(), e.fillStyle = te(M.color), e.rotate((F + _) / 2), e.textAlign = "right", e.font = `${Math.max(14, a * 0.08)}px sans-serif`, e.fillText(M.label, V - 20, 6), e.restore();
      }), u > 0 && (e.beginPath(), e.arc(0, 0, V, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.save(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.fill(), e.restore(), u > 0 && (e.beginPath(), e.arc(0, 0, l, 0, Math.PI * 2), e.strokeStyle = n.borderColor, e.lineWidth = u, e.stroke()), e.restore();
    }, w = () => {
      x.value !== null && (cancelAnimationFrame(x.value), x.value = null);
    }, ne = () => {
      w(), x.value = requestAnimationFrame(j);
    }, j = (t) => {
      r.value.startTime || (r.value.startTime = t);
      const e = t - r.value.startTime, o = r.value.duration || 1, a = Math.min(e / o, 1), l = n.easingFunction(a);
      i.value = r.value.startAngle + (r.value.endAngle - r.value.startAngle) * l, N(), ee(), f(), a < 1 ? x.value = requestAnimationFrame(j) : ae();
    }, ae = () => {
      w(), b.value = !1, k.value = !1, N(), f(), S("spin-end");
      const t = $();
      z.value = t, t && S("select", t);
    }, le = () => {
      const t = Math.floor(n.initialVelocity * n.spinDuration / 36e4);
      return Math.max(3, t) + Math.floor(Math.random() * 3);
    }, q = () => {
      if (s.value.length <= 1)
        return 0.5;
      const t = 0.04;
      return t + Math.random() * (1 - t * 2);
    }, E = (t, e, o = 0.5) => {
      if (!s.value.length)
        return i.value;
      const a = B.value, l = R(i.value), v = Math.min(Math.max(o, 0.01), 0.99), u = a / 2;
      let d = (360 - (t + v) * a + u) % 360 - l;
      return d <= 0 && (d += 360), d += e * 360, i.value + d;
    }, H = () => {
      if (!s.value.length || b.value)
        return;
      k.value = !1;
      const t = Math.floor(Math.random() * s.value.length), e = s.value[t];
      e && (z.value = e, r.value.startAngle = i.value, r.value.endAngle = E(t, le(), q()), r.value.duration = n.spinDuration, r.value.startTime = 0, b.value = !0, S("spin-start"), ne());
    }, oe = () => {
      if (!b.value || k.value)
        return;
      k.value = !0;
      const t = h(i.value);
      if (t === null)
        return;
      const e = s.value[t];
      e && (z.value = e, r.value.startAngle = i.value, r.value.endAngle = E(t, 1, q()), r.value.duration = Math.min(n.spinDuration / 2, 1e3), r.value.startTime = 0);
    }, re = () => {
      w(), b.value = !1, k.value = !1, z.value = null, i.value = n.initialAngle, r.value = {
        startAngle: n.initialAngle,
        endAngle: n.initialAngle,
        duration: n.spinDuration,
        startTime: 0
      }, N(), f(), A.value = h(i.value);
    }, ie = () => {
      n.spinOnClick && H();
    };
    return m(
      () => n.size,
      () => {
        I(f);
      }
    ), m(
      () => n.centerHoleRatio,
      () => {
        I(f);
      }
    ), m(
      () => n.borderWidth,
      () => {
        I(f);
      }
    ), m(
      () => n.borderColor,
      () => {
        I(f);
      }
    ), m(
      () => n.pointerPosition,
      () => {
        A.value = h(i.value);
      }
    ), m(
      () => n.initialAngle,
      (t) => {
        b.value || (i.value = t, r.value.startAngle = t, r.value.endAngle = t, r.value.startTime = 0, f());
      }
    ), m(
      () => n.spinDuration,
      (t) => {
        r.value.duration = t;
      }
    ), m(s, () => {
      I(() => {
        A.value = h(i.value), f();
      });
    }), fe(() => {
      f(), A.value = h(i.value);
    }), de(() => {
      w(), C.value && C.value.close();
    }), O({
      spin: H,
      stop: oe,
      reset: re,
      getCurrentItem: $
    }), (t, e) => (U(), G("div", {
      class: "casino-roulette",
      style: J({ width: c.size + "px", height: c.size + "px" })
    }, [
      K("canvas", {
        ref_key: "canvasRef",
        ref: W,
        class: L(["roulette-canvas", { clickable: c.spinOnClick }]),
        width: c.size,
        height: c.size,
        "aria-label": `Roulette avec ${s.value.length} sections`,
        onClick: ie
      }, null, 10, pe),
      Q.value ? (U(), G("div", {
        key: 0,
        class: L(["roulette-pointer", `pointer-${n.pointerPosition}`]),
        style: J(X.value)
      }, [...e[0] || (e[0] = [
        K("div", { class: "pointer-shape" }, null, -1)
      ])], 6)) : ve("", !0)
    ], 4));
  }
}), Ae = (c, O) => {
  const T = c.__vccOpts || c;
  for (const [y, n] of O)
    T[y] = n;
  return T;
}, xe = /* @__PURE__ */ Ae(be, [["__scopeId", "data-v-fc7087a8"]]);
export {
  xe as VueRoulette,
  xe as default
};
