import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedNumber({ value, className = '' }) {
  const [display, setDisplay] = useState(value);
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return displayValue.on("change", (latest) => setDisplay(latest));
  }, [displayValue]);

  return <span className={className}>{display}</span>;
}
