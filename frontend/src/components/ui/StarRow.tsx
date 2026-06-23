/* Interactive star row — click to set minimum rating */
interface Props {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
}

export default function StarRow({ value, onChange, readOnly = false, size = 28 }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size} height={size} viewBox="0 0 24 24"
          style={{ cursor: readOnly ? 'default' : 'pointer', flexShrink: 0, transition: 'transform 0.15s' }}
          onClick={() => !readOnly && onChange?.(i)}
          onMouseEnter={(e) => { if (!readOnly) (e.currentTarget as SVGElement).style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { if (!readOnly) (e.currentTarget as SVGElement).style.transform = 'scale(1)'; }}
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= value ? '#eec140' : 'none'}
            stroke={i <= value ? '#eec140' : '#47464c'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
      {value > 0 && (
        <span style={{ marginLeft: 6, fontSize: 13, color: '#c8c5cc', fontWeight: 500 }}>
          {value}.0+
        </span>
      )}
    </div>
  );
}
