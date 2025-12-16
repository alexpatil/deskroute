// components/InfoBox.tsx
interface InfoBoxProps {
  title: string;
  items: string[];
}

export function InfoBox({ title, items }: InfoBoxProps) {
  return (
    <div className='rounded-xl p-4 border' style={{ backgroundColor: "var(--color-infoLight)", borderColor: "var(--color-info)" }}>
      <h3 className='text-sm font-bold mb-2' style={{ color: "var(--color-info)" }}>
        {title}
      </h3>
      <ul className='text-sm space-y-1' style={{ color: "var(--color-info)" }}>
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
