interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">About Vocabulous</h2>
        <p className="text-gray-600 mb-4">
          Vocabulous is an interactive platform designed to make vocabulary learning fun and engaging.
          Through various minigames like Speed Challenge, Flashcards, Scenario Learning,
          Word Scramble, and Word of the Day, users can enhance their vocabulary in an enjoyable way.
        </p>
        <p className="text-gray-600 mb-6">
          Whether you're preparing for tests, learning English, or simply want to expand your vocabulary,
          Vocabulous provides an entertaining and effective learning experience.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
