'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// * hooks
import { useHtmlContext } from '@/context/HtmlContextProvider';

// * components
import Modal from '@/components/Modal';

const SubmitButton = () => {
  const [similarityPercent, setSimilarityPercent] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const { html } = useHtmlContext();
  const teamName = localStorage.getItem('teamName');
  const router = useRouter(); // Initialize router

  const clickHandler = async () => {
    setLoading(true);
    router.push('/logout');

    try {
      const res = await fetch('/api/challenge?id=1', {
        method: 'POST',
        body: JSON.stringify({ html, teamName }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { data } = await res.json();
      setSimilarityPercent(data.similarity);

      // Navigate to /logout after submission
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className='flex items-center justify-center'>
    <button
      type="button"
      disabled={loading}
      onClick={clickHandler}
      className="w-1/2 items-center bg-orange-500 hover:bg-orange-600 disabled:bg-orange-600/50 rounded-md p-2 mt-12 font-semibold" 
    >
      Submit
      <Modal isOpen={similarityPercent !== undefined}>
        <div className="text-xl text-orange-500 font-bold">Congrats !!!</div>
        <p className="mt-3">
          You finished the challenge with
          <span className="text-orange-500 font-bold mx-1">{similarityPercent}%</span>
          similarity. 😊
        </p>
      </Modal>
    </button>
    </div>
  );
};

export default SubmitButton;
