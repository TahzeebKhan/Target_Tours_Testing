// Reusable TravellerSelector.jsx (drop into your component file or import)
import { useState, useRef, useEffect } from 'react'

const truncate = (str = "", max = 17) =>
  typeof str === 'string' ? (str.length > max ? str.slice(0, max) + "..." : str) : ""

export default function TravellerSelector({
  travellerClass,        // selected value (shared state)
  setTravellerClass,     // setter to update shared value
  travellerOptions,      // array [{ value, label }]
  wrapperClass = "",     // optional classname for parent .fromBtn sizing
  styles,
  name,                // pass your module styles object
  className
}) {
  const [open, setOpen] = useState(false)
  const localRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (localRef.current && !localRef.current.contains(e.target)) setOpen(false)
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  // If `travellerClass` already contains the display text (or an object with .label),
  // prefer that directly. Otherwise, lookup by value in `travellerOptions`.
  let selectedLabel = "1 Traveller, Economy";
  if (typeof travellerClass === 'string') {
    const found = travellerOptions.find(o => o.value === travellerClass);
    selectedLabel = found ? found.label : travellerClass || selectedLabel;
  } else if (travellerClass && typeof travellerClass === 'object' && travellerClass.label) {
    selectedLabel = travellerClass.label;
  }

  return (
    <div className={`${styles.fromBtn} ${className}  ${wrapperClass}`}>
      <div className={styles.lable}>{name}</div>

      <div
        className={styles.dateInputWrapper}
        ref={localRef}
        onClick={() => setOpen(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(prev => !prev) }}
      >
        <div className={styles.contant}>
          {truncate(selectedLabel, 17)}
        </div>

        <img className={styles.downArrowTravel} src="/images/Vector.svg" alt="open" />

        {open && (
          <div className={styles.selectMenu} role="menu" aria-label="Travellers and class options">
            {travellerOptions.map(opt => (
              <div
                key={opt.value}
                role="menuitem"
                tabIndex={0}
                className={styles.selectItem}
                onClick={(e) => { e.stopPropagation(); setTravellerClass(opt.value); setOpen(false) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setTravellerClass(opt.value)
                    setOpen(false)
                  }
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
