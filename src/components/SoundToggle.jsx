import Button from './Button';

export default function SoundToggle({ soundOn, onToggle }) {
  return (
    <Button
      onClick={onToggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      title={soundOn ? 'Sound on' : 'Sound off'}
    >
      {soundOn ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
          <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
          <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />
        </svg>
      )}
      {soundOn ? 'sound on' : 'sound off'}
    </Button>
  );
}
