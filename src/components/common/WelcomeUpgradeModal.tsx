import React, {useState} from "react";
import {Button, Card} from "../ui";

export const WelcomeUpgradeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md border-primary-200 bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/30 dark:to-pink-900/30">
        <div className="text-center">
          {/* Heart emoji header */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-900/50">
              <span className="text-2xl">💕</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            <strong>Hey beautiful!</strong> ✨
          </h2>

          {/* Message */}
          <div className="mb-6 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
            <p>აპლიკაცია განვაახლე, როგორც ნახავდი რეგისტრაცია შეგიძლია ეხლა და ქარდების გაზიარებასაც შევძლებთ ცოტა ხანში 🎉</p>
            <p></p>
            <p className="text-xs italic text-neutral-500 dark:text-neutral-400">მთელი ღამე გავათენე ჰოდა დღეს შეიძლება ნაკლებად ხელმისაწვდომი ვიყო, ალბათ ნახევარ დღეს ოფსაც ავიღებ, მეორე ნახევარი ქოლებში წავა</p>
            <p className="text-sm italic text-emerald-600">
              <strong>მიყვარხარ!!!</strong>
            </p>
            <p className="text-xs italic text-neutral-500 dark:text-neutral-400">ძველი ქარდების შექმნა არ დაიწყო, შენახულია ყველაფერი და აღვადგენ რო გავიღვიძებ</p>
          </div>

          {/* Close button */}
          <Button onClick={() => setIsOpen(false)} className="w-full bg-gradient-to-r from-primary-500 to-pink-500 text-white hover:from-primary-600 hover:to-pink-600">
            Ich liebe dich! 💖
          </Button>
        </div>
      </Card>
    </div>
  );
};
