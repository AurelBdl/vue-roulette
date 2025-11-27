import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';

declare const _default: DefineComponent<ExtractPropTypes<    {
items: {
type: PropType<RouletteItem[]>;
required: true;
};
size: {
type: NumberConstructor;
default: number;
};
spinDuration: {
type: NumberConstructor;
default: number;
};
easingFunction: {
type: PropType<(t: number) => number>;
default: (t: number) => number;
};
useColor: {
type: BooleanConstructor;
default: boolean;
};
initialVelocity: {
type: NumberConstructor;
default: number;
};
initialAngle: {
type: NumberConstructor;
default: number;
};
enableTickSound: {
type: BooleanConstructor;
default: boolean;
};
pointerOptions: {
type: PropType<PointerOptions>;
default: () => {};
};
pointerPosition: {
type: PropType<"top" | "right" | "bottom" | "left">;
default: string;
};
centerHoleRatio: {
type: NumberConstructor;
default: number;
};
spinOnClick: {
type: BooleanConstructor;
default: boolean;
};
tickSoundVolume: {
type: NumberConstructor;
default: number;
};
borderWidth: {
type: NumberConstructor;
default: number;
};
borderColor: {
type: StringConstructor;
default: string;
};
}>, {
spin: () => void;
stop: () => void;
reset: () => void;
getCurrentItem: () => RouletteItem | null;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
"spin-start": () => any;
"spin-end": () => any;
select: (item: RouletteItem) => any;
"update:angle": (angle: number) => any;
}, string, PublicProps, Readonly<ExtractPropTypes<    {
items: {
type: PropType<RouletteItem[]>;
required: true;
};
size: {
type: NumberConstructor;
default: number;
};
spinDuration: {
type: NumberConstructor;
default: number;
};
easingFunction: {
type: PropType<(t: number) => number>;
default: (t: number) => number;
};
useColor: {
type: BooleanConstructor;
default: boolean;
};
initialVelocity: {
type: NumberConstructor;
default: number;
};
initialAngle: {
type: NumberConstructor;
default: number;
};
enableTickSound: {
type: BooleanConstructor;
default: boolean;
};
pointerOptions: {
type: PropType<PointerOptions>;
default: () => {};
};
pointerPosition: {
type: PropType<"top" | "right" | "bottom" | "left">;
default: string;
};
centerHoleRatio: {
type: NumberConstructor;
default: number;
};
spinOnClick: {
type: BooleanConstructor;
default: boolean;
};
tickSoundVolume: {
type: NumberConstructor;
default: number;
};
borderWidth: {
type: NumberConstructor;
default: number;
};
borderColor: {
type: StringConstructor;
default: string;
};
}>> & Readonly<{
"onSpin-start"?: (() => any) | undefined;
"onSpin-end"?: (() => any) | undefined;
onSelect?: ((item: RouletteItem) => any) | undefined;
"onUpdate:angle"?: ((angle: number) => any) | undefined;
}>, {
size: number;
spinDuration: number;
easingFunction: (t: number) => number;
useColor: boolean;
initialVelocity: number;
initialAngle: number;
enableTickSound: boolean;
pointerOptions: PointerOptions;
pointerPosition: "top" | "right" | "bottom" | "left";
centerHoleRatio: number;
spinOnClick: boolean;
tickSoundVolume: number;
borderWidth: number;
borderColor: string;
}, {}, {}, {}, string, ComponentProvideOptions, true, {
canvasRef: HTMLCanvasElement;
}, HTMLDivElement>;
export { _default as VueRoulette }
export default _default;

declare type PointerOptions = {
    visible?: boolean;
    color?: string;
    width?: number;
    length?: number;
};

export declare interface RouletteItem {
    label: string;
    value: unknown;
    color?: string;
}

export { }
