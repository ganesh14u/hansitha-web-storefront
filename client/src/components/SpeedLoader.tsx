import React from "react";

const SpeederLoader: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col items-center justify-center">
      {/* Logo */}
      <img
        src="https://res.cloudinary.com/djyredhur/image/upload/v1751127717/logo_ktewtc.png"
        alt="Hansitha Logo"
        className="h-32 w-auto mb-8 z-10"
      />

      {/* Shift wrapper */}
      <div style={{ transform: "translateX(-60px)" }}>
        {/* Speeder Body */}
        <div
          className="relative flex justify-center"
          style={{
            animation: "speeder 0.4s linear infinite",
          }}
        >
          <span className="absolute h-[5px] w-[35px] bg-black top-[-19px] left-[60px] rounded-tr-lg rounded-bl-sm" />

          {/* Fazer lines */}
          {[1, 2, 3, 4].map((_, i) => (
            <span
              key={i}
              className="absolute h-[1px] w-[30px] bg-black"
              style={{
                top:
                  i === 1
                    ? "3px"
                    : i === 2
                    ? "1px"
                    : i === 3
                    ? "4px"
                    : undefined,
                animation: `fazer${i + 1} ${
                  i === 0
                    ? "0.2s"
                    : i === 1
                    ? "0.4s"
                    : i === 2
                    ? "0.4s"
                    : "1s"
                } linear infinite`,
                animationDelay: i >= 2 ? "-1s" : undefined,
              }}
            />
          ))}

          {/* Base */}
          <div className="relative">
            <span
              className="absolute"
              style={{
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderRight: "100px solid black",
                borderBottom: "6px solid transparent",
              }}
            >
              <span
                className="absolute rounded-full bg-black"
                style={{
                  height: "22px",
                  width: "22px",
                  right: "-110px",
                  top: "-16px",
                }}
              />
              <span
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "0 solid transparent",
                  borderRight: "55px solid black",
                  borderBottom: "16px solid transparent",
                  top: "-16px",
                  right: "-98px",
                }}
              />
            </span>

            {/* Face */}
            <div
              className="absolute bg-black"
              style={{
                height: "12px",
                width: "20px",
                borderRadius: "20px 20px 0 0",
                transform: "rotate(-40deg)",
                right: "-125px",
                top: "-15px",
              }}
            >
              <div
                className="absolute bg-black"
                style={{
                  height: "12px",
                  width: "12px",
                  right: "4px",
                  top: "7px",
                  transform: "rotate(40deg)",
                  transformOrigin: "50% 50%",
                  borderRadius: "0 0 0 2px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Long fazers */}
      <div className="absolute w-full h-full">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute h-[2px] w-[20%] bg-black"
            style={{
              top: `${i * 20}%`,
              animation: `lf${i} ${
                i === 1
                  ? "0.6s"
                  : i === 2
                  ? "0.8s"
                  : i === 3
                  ? "0.6s"
                  : "0.5s"
              } linear infinite`,
              animationDelay:
                i === 1
                  ? "-5s"
                  : i === 2
                  ? "-1s"
                  : i === 4
                  ? "-3s"
                  : undefined,
            }}
          />
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }
        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes lf1 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf2 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf3 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf4 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SpeederLoader;
