let recognition;

const handleMicrophoneClick = (isListening, setIsListening, setInputValue) => {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recognition) {
      recognition = new SpeechRecognition();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  } else {
    alert("Your browser does not support speech recognition.");
  }
};

export default handleMicrophoneClick;