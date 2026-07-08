import { useLottie } from "lottie-react";
import shipAnimation from "../../assets/animations/ship.json";

function Spinner({ message = "Preparando frota..." }) {
  const options = {
    animationData: shipAnimation,
    loop: true,
    autoplay: true,
  };

  const style = {
    width: "100%",
    height: "100%",
  };

  const { View } = useLottie(options, style);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-center items-center backdrop-blur-md bg-blue-dark-900/80 z-9999">
      <div className="w-48 h-48 sm:w-64 sm:h-64 flex justify-center items-center">
        {View}
      </div>
      <p className="mt-4 text-orange-300 font-anybody font-extrabold tracking-widest text-xs uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}

export default Spinner;
