interface ToggleSwitchProps {
  checked: boolean
  onChange: (val: boolean) => void
}

export default function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 44,
        height: 24,
        backgroundColor: checked ? '#00C4B4' : '#D1D5DB',
      }}
      aria-checked={checked}
      role="switch"
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 20,
          height: 20,
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}