

import { useState, useRef, useEffect } from 'react'

const truncate = (str = "", max = 17) =>
  typeof str === 'string'
    ? (str.length > max ? str.slice(0, max) + "..." : str)
    : ""

export default function TravellerSelector({
  travellerClass,
  setTravellerClass,
  travellerOptions,
  wrapperClass = "",
  styles,
  name,
  className,

  /* 🔥 NEW PROPS */
  enableEllipsis = true,
  maxLength = 17,
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

  const handleFieldClick = (e) => {
    setOpen(prev => !prev);
  };
  // Resolve selected label
  let selectedLabel = "1 Traveller, Economy"

  if (typeof travellerClass === 'string') {
    const found = travellerOptions.find(o => o.value === travellerClass)
    selectedLabel = found ? found.label : travellerClass || selectedLabel
  } else if (travellerClass?.label) {
    selectedLabel = travellerClass.label
  }

  const displayLabel = enableEllipsis
    ? truncate(selectedLabel, maxLength)
    : selectedLabel

  return (
    <div className={`${styles.fromBtn} ${className} ${wrapperClass}`} onClick={handleFieldClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setOpen(prev => !prev);
        }
      }}>
      <div className={styles.lable}>{name}</div>

      <div
        className={styles.dateInputWrapper}
        ref={localRef}

      >
        <div className={styles.contant}>
          {displayLabel}
        </div>

        <img
          className={styles.downArrowTravel}
          src="/images/Vector.svg"
          alt="open"
        />

        {open && (
          <div className={styles.selectMenu}>
            {travellerOptions.map(opt => (
              <div
                key={opt.value}
                className={styles.selectItem}
                onClick={(e) => {
                  e.stopPropagation(); // ✅ important
                  setTravellerClass(opt.value);
                  setOpen(false);
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
