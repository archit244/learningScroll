import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ThinkTimer({ question, answer, duration = 5 }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  // Parse content if it comes as a single string with ||| delimiter
  const { parsedQuestion, parsedAnswer } = React.useMemo(() => {
    if (typeof question === 'string' && question.includes(' ||| ')) {
      const [q, a] = question.split(' ||| ');
      return {
        parsedQuestion: q.trim(),
        parsedAnswer: a ? a.trim() : (answer || "Here is the insight.")
      };
    }
    return {
      parsedQuestion: typeof question === 'string' ? question : "Think about this...",
      parsedAnswer: typeof answer === 'string' ? answer : "Here is the insight."
    };
  }, [question, answer]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(true);
    }
  }, [timeLeft]);

  const contentLength = parsedQuestion.length + parsedAnswer.length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '40px',
      padding: '40px 0',
      overflow: 'hidden'
    }}>
      <div style={{
        overflowY: 'auto',
        width: '100%',
        maxHeight: '60vh'
      }}>
        <h2 style={{
          fontSize: contentLength > 200 ? '1.1rem' : '1.5rem',
          lineHeight: '1.4',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: '#000',
          marginBottom: '20px'
        }}>
          {parsedQuestion}
        </h2>
      </div>

      {!isRevealed ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '8px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: '#000'
            }}>{timeLeft}</span>
          </div>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>Analyzing...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '16px',
            border: '2px solid #f3f4f6',
            maxWidth: '100%',
            overflowY: 'auto',
            maxHeight: '40vh'
          }}
        >
          <span style={{
            color: '#9ca3af',
            fontWeight: 900,
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            display: 'block',
            marginBottom: '16px'
          }}>The Insight</span>
          <p style={{
            fontSize: contentLength > 200 ? '1rem' : '1.25rem',
            lineHeight: '1.4',
            fontWeight: 700,
            color: '#000'
          }}>
            {parsedAnswer}
          </p>
        </motion.div>
      )}
    </div>
  );
}