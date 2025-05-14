import { useEffect, useState } from "react";

/**
 * React hook to get the time before the next Tunele.
 *
 * @param targetDate the date to compute the time before
 * @returns the time before the next Tunele
 */
export const useCountdown = (targetDate: number) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    targetDate - new Date().getTime()
  );

  useEffect(() => {
    let animationFrameId: number;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      setTimeLeft(distance);

      if (distance < 0) cancelAnimationFrame(animationFrameId);
      else animationFrameId = requestAnimationFrame(updateCountdown);
    };

    animationFrameId = requestAnimationFrame(updateCountdown);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetDate]);

  return timeLeft;
};
