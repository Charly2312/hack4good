import React, { useEffect, useRef } from "react";
import "./Clock1.css";

function Clock1() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const radius = canvas.height / 2;
    ctx.translate(radius, radius);

    function drawClock() {
      ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
      drawFace(ctx, radius);
      drawNumbers(ctx, radius);
      drawTime(ctx, radius);
    }

    function drawFace(ctx, radius) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
      ctx.fillStyle = "#333";
      ctx.fill();
    }

    function drawNumbers(ctx, radius) {
      ctx.font = `${radius * 0.15}px arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      for (let num = 1; num <= 12; num++) {
        const ang = (num * Math.PI) / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
      }
    }

    function drawTime(ctx, radius) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      const hourHand =
        ((hour % 12) * Math.PI) / 6 +
        (minute * Math.PI) / 360 +
        (second * Math.PI) / 21600;
      drawHand(ctx, hourHand, radius * 0.5, radius * 0.07);
      const minuteHand = (minute * Math.PI) / 30 + (second * Math.PI) / 1800;
      drawHand(ctx, minuteHand, radius * 0.8, radius * 0.07);
      const secondHand = (second * Math.PI) / 30;
      drawHand(ctx, secondHand, radius * 0.9, radius * 0.02);
    }

    function drawHand(ctx, pos, length, width) {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.moveTo(0, 0);
      ctx.rotate(pos);
      ctx.lineTo(0, -length);
      ctx.stroke();
      ctx.rotate(-pos);
    }

    const intervalId = setInterval(drawClock, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="clock1">
      <canvas
        id="clockCanvas1"
        ref={canvasRef}
        width="400"
        height="400"
      ></canvas>
    </div>
  );
}

export default Clock1;