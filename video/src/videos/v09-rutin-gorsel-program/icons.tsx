import React from 'react';
import {C} from '../../shared/brand';

// Flat, friendly illustrations (viewBox 0 0 200 200). Palette: brand + one muted sky blue.
export const P = {
  g: C.green,
  g2: '#2F5D52',
  leaf: '#4F7F68',
  leaf2: '#6E9C7F',
  leafL: '#A9C7A6',
  o: C.orange,
  oL: '#F3C681',
  oD: '#D18B2A',
  brown: C.orangeDeep,
  sky: '#8DB8C8',
  skyD: '#5C8DA0',
  skyL: '#D3E6EC',
  w: '#FFFFFF',
  cream: C.cream,
  line: '#DCE4DF',
};

const Spark: React.FC<{x: number; y: number; r: number; fill: string}> = ({x, y, r, fill}) => (
  <path
    d={`M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`}
    fill={fill}
  />
);

const Svg: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 200}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{display: 'block', overflow: 'visible'}}>
    {children}
  </svg>
);

export const Plate: React.FC = () => (
  <Svg>
    <ellipse cx={104} cy={112} rx={70} ry={68} fill="rgba(18,49,43,0.10)" />
    <circle cx={100} cy={104} r={70} fill={P.w} />
    <circle cx={100} cy={104} r={68.5} fill="none" stroke={P.line} strokeWidth={3} />
    <circle cx={100} cy={104} r={52} fill="#EEF2EF" />
    {/* egg */}
    <path d="M66 98 C 62 78, 88 70, 100 80 C 114 72, 130 88, 124 102 C 130 118, 108 128, 96 120 C 80 128, 62 114, 66 98 Z" fill={P.w} />
    <circle cx={96} cy={99} r={14} fill={P.o} />
    <circle cx={91} cy={94} r={4.5} fill="#F8D394" />
    {/* cucumber + olives */}
    <circle cx={122} cy={128} r={11} fill={P.leaf2} />
    <circle cx={122} cy={128} r={7.5} fill={P.leafL} />
    <circle cx={104} cy={136} r={10} fill={P.leaf2} />
    <circle cx={104} cy={136} r={6.5} fill={P.leafL} />
    <ellipse cx={134} cy={104} rx={6} ry={8} fill={P.g} transform="rotate(20 134 104)" />
    <ellipse cx={80} cy={130} rx={6} ry={8} fill={P.g} transform="rotate(-20 80 130)" />
    {/* fork + spoon */}
    <rect x={14} y={70} width={8} height={92} rx={4} fill={P.g2} />
    <path d="M8 46 V 70 C 8 78, 28 78, 28 70 V 46" fill="none" stroke={P.g2} strokeWidth={5} strokeLinecap="round" />
    <line x1={18} y1={46} x2={18} y2={70} stroke={P.g2} strokeWidth={4} strokeLinecap="round" />
    <rect x={178} y={80} width={8} height={84} rx={4} fill={P.g2} />
    <ellipse cx={182} cy={62} rx={11} ry={18} fill={P.g2} />
  </Svg>
);

export const Toothbrush: React.FC = () => (
  <Svg>
    <ellipse cx={100} cy={170} rx={64} ry={8} fill="rgba(18,49,43,0.10)" />
    <g transform="rotate(-32 100 110)">
      <rect x={18} y={104} width={124} height={22} rx={11} fill={P.o} />
      <rect x={26} y={109} width={52} height={12} rx={6} fill={P.oL} />
      <rect x={136} y={106} width={52} height={18} rx={8} fill={P.o} />
      <rect x={140} y={78} width={44} height={30} rx={6} fill={P.w} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={144 + i * 8} y={80} width={3} height={24} rx={1.5} fill={P.skyL} />
      ))}
      <path d="M136 76 C 140 60, 152 70, 158 58 C 164 46, 178 54, 186 62 C 190 70, 182 78, 170 78 L 144 78 C 138 78, 135 78, 136 76 Z" fill={P.sky} />
      <path d="M150 70 C 156 66, 162 64, 168 62" stroke={P.w} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
    </g>
    <Spark x={52} y={52} r={13} fill={P.sky} />
    <Spark x={78} y={30} r={7} fill={P.skyD} />
    <Spark x={176} y={150} r={9} fill={P.sky} />
  </Svg>
);

export const Backpack: React.FC = () => (
  <Svg>
    <ellipse cx={100} cy={178} rx={58} ry={8} fill="rgba(18,49,43,0.12)" />
    <path d="M84 46 C 84 26, 116 26, 116 46" fill="none" stroke={P.g} strokeWidth={9} strokeLinecap="round" />
    <rect x={40} y={70} width={20} height={80} rx={10} fill={P.g2} />
    <rect x={140} y={70} width={20} height={80} rx={10} fill={P.g2} />
    <rect x={50} y={42} width={100} height={134} rx={32} fill={P.o} />
    <rect x={60} y={58} width={12} height={76} rx={6} fill={P.oL} opacity={0.85} />
    <path d="M50 76 C 50 56, 64 42, 82 42 L 118 42 C 136 42, 150 56, 150 76 L 150 92 C 150 99, 146 102, 140 102 L 60 102 C 54 102, 50 99, 50 92 Z" fill={P.g2} />
    <rect x={91} y={92} width={18} height={22} rx={5} fill={P.cream} />
    <rect x={64} y={122} width={72} height={42} rx={14} fill={P.oD} />
    <line x1={74} y1={133} x2={126} y2={133} stroke={P.cream} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="1 7" />
  </Svg>
);

export const Ball: React.FC = () => (
  <Svg>
    <ellipse cx={100} cy={176} rx={52} ry={9} fill="rgba(18,49,43,0.14)" />
    <defs>
      <clipPath id="ballClip">
        <circle cx={100} cy={100} r={64} />
      </clipPath>
    </defs>
    <circle cx={100} cy={100} r={64} fill={P.w} />
    <g clipPath="url(#ballClip)">
      <path d="M100 36 C 30 56, 30 146, 100 166 C 62 136, 62 64, 100 36 Z" fill={P.o} />
      <path d="M100 36 C 170 56, 170 146, 100 166 C 138 136, 138 64, 100 36 Z" fill={P.sky} />
      <path d="M36 100 C 44 150, 88 170, 100 166 L 40 166 Z" fill="rgba(18,49,43,0.06)" />
      <circle cx={100} cy={38} r={10} fill={P.g2} />
    </g>
    <ellipse cx={76} cy={70} rx={14} ry={8} fill={P.w} opacity={0.55} transform="rotate(-35 76 70)" />
    <path d="M22 70 C 14 90, 14 112, 22 132" stroke={P.leaf2} strokeWidth={6} strokeLinecap="round" fill="none" />
    <path d="M6 82 C 2 94, 2 108, 6 120" stroke={P.leafL} strokeWidth={5} strokeLinecap="round" fill="none" />
  </Svg>
);

export const Bathtub: React.FC = () => (
  <Svg>
    <path d="M40 98 V 50 C 40 36, 64 36, 64 50 V 56" fill="none" stroke={P.g2} strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={64} cy={70} rx={4} ry={6} fill={P.sky} />
    {[
      [56, 92, 12],
      [76, 84, 15],
      [100, 90, 12],
      [120, 82, 15],
      [144, 90, 12],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={P.w} stroke={P.skyL} strokeWidth={2.5} />
    ))}
    {/* duck */}
    <ellipse cx={150} cy={78} rx={18} ry={11} fill={P.o} />
    <circle cx={158} cy={62} r={10} fill={P.o} />
    <path d="M166 62 L 176 64 L 166 68 Z" fill={P.brown} />
    <circle cx={160} cy={60} r={2.2} fill={P.g} />
    <rect x={22} y={96} width={156} height={16} rx={8} fill={P.skyL} />
    <path d="M30 106 H170 V120 C170 148, 150 162, 122 162 H78 C50 162, 30 148, 30 120 Z" fill={P.w} />
    <path d="M30 120 C 30 148, 50 162, 78 162 H 90 C 64 158, 46 144, 42 120 Z" fill="rgba(18,49,43,0.05)" />
    <rect x={50} y={158} width={14} height={18} rx={5} fill={P.g2} />
    <rect x={136} y={158} width={14} height={18} rx={5} fill={P.g2} />
  </Svg>
);

export const Bed: React.FC = () => (
  <Svg>
    <path d="M150 26 A 24 24 0 1 0 174 62 A 19 19 0 1 1 150 26 Z" fill={P.o} />
    <Spark x={112} y={40} r={9} fill={P.oL} />
    <Spark x={184} y={92} r={6} fill={P.oL} />
    <Spark x={130} y={70} r={5} fill={P.o} />
    <rect x={20} y={84} width={20} height={92} rx={9} fill={P.g2} />
    <rect x={164} y={116} width={16} height={60} rx={8} fill={P.g2} />
    <rect x={32} y={124} width={140} height={30} rx={10} fill={P.w} />
    <rect x={44} y={104} width={44} height={24} rx={12} fill={P.w} stroke={P.line} strokeWidth={2.5} />
    <path d="M80 114 H162 C 168 114, 172 118, 172 124 V 154 H 80 C 72 154, 68 148, 68 140 V 126 C 68 118, 72 114, 80 114 Z" fill={P.sky} />
    <path d="M80 130 H 172" stroke={P.skyL} strokeWidth={4} />
    <rect x={32} y={152} width={140} height={10} rx={5} fill={P.g2} />
  </Svg>
);

export const Shoes: React.FC = () => (
  <Svg>
    <ellipse cx={100} cy={162} rx={80} ry={8} fill="rgba(18,49,43,0.12)" />
    <g transform="translate(26 -28) scale(0.86)">
      <path d="M30 120 C 30 98, 40 84, 56 84 L 76 84 C 84 96, 98 102, 114 104 L 140 110 C 158 114, 168 124, 168 136 L 168 140 H 30 Z" fill={P.oD} />
      <rect x={26} y={136} width={146} height={14} rx={7} fill={P.cream} />
    </g>
    <path d="M24 122 C 24 98, 34 84, 50 84 L 72 84 C 80 96, 96 102, 112 104 L 142 110 C 162 114, 172 126, 172 138 L 172 142 H 24 Z" fill={P.o} />
    <path d="M130 108 L 142 110 C 162 114, 172 126, 172 138 L 172 142 H 140 C 140 126, 138 114, 130 108 Z" fill={P.oL} />
    <path d="M50 84 L 72 84 C 70 100, 56 108, 44 106 Z" fill={P.g2} opacity={0.9} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={80 + i * 13} y1={98 + i * 3.5} x2={90 + i * 13} y2={92 + i * 3.5} stroke={P.w} strokeWidth={4.5} strokeLinecap="round" />
    ))}
    <rect x={20} y={138} width={156} height={16} rx={8} fill={P.w} stroke={P.line} strokeWidth={2.5} />
  </Svg>
);

export const Park: React.FC = () => (
  <Svg>
    <circle cx={154} cy={46} r={20} fill={P.o} />
    <circle cx={154} cy={46} r={28} fill={P.o} opacity={0.18} />
    <path d="M-10 150 C 40 124, 120 124, 210 144 V 210 H -10 Z" fill={P.leafL} />
    <path d="M-10 172 C 60 154, 140 160, 210 170 V 210 H -10 Z" fill={P.leaf2} opacity={0.6} />
    <rect x={90} y={96} width={18} height={62} rx={7} fill={P.brown} />
    <circle cx={99} cy={76} r={40} fill={P.leaf} />
    <circle cx={72} cy={92} r={26} fill={P.leaf2} />
    <circle cx={128} cy={90} r={28} fill="#3F6E5A" />
    <circle cx={86} cy={62} r={12} fill={P.leaf2} opacity={0.8} />
    <circle cx={34} cy={146} r={14} fill={P.leaf} />
    <circle cx={50} cy={150} r={11} fill={P.leaf2} />
    <circle cx={168} cy={150} r={10} fill={P.leaf} />
  </Svg>
);

export const Gift: React.FC = () => (
  <Svg>
    <ellipse cx={100} cy={176} rx={60} ry={8} fill="rgba(18,49,43,0.14)" />
    <Spark x={36} y={52} r={14} fill={P.o} />
    <Spark x={168} y={40} r={10} fill={P.g2} />
    <Spark x={176} y={120} r={7} fill={P.o} />
    <Spark x={24} y={124} r={7} fill={P.g2} />
    <rect x={52} y={100} width={96} height={72} rx={10} fill={P.o} />
    <rect x={52} y={100} width={96} height={14} fill={P.oD} opacity={0.5} />
    <rect x={44} y={80} width={112} height={28} rx={9} fill={P.oL} />
    <rect x={92} y={80} width={16} height={92} fill={P.g2} />
    <path d="M100 80 C 80 52, 58 60, 66 74 C 72 84, 90 82, 100 80 Z" fill={P.g2} />
    <path d="M100 80 C 120 52, 142 60, 134 74 C 128 84, 110 82, 100 80 Z" fill={P.g2} />
    <circle cx={100} cy={80} r={8} fill={P.g} />
  </Svg>
);

export const Check: React.FC<{size?: number}> = ({size = 120}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{display: 'block'}}>
    <circle cx={60} cy={60} r={52} fill={C.orange} />
    <path d="M36 62 L 53 79 L 86 44" fill="none" stroke={C.greenDeep} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
