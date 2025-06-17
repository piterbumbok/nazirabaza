import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify, className = "" }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Генерируем простую математическую капчу
  const generateCaptcha = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
    }
    
    const captchaString = `${num1} ${operation} ${num2}`;
    setCaptchaText(captchaString);
    
    // Сохраняем правильный ответ в data-атрибуте
    return answer.toString();
  };

  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    const answer = generateCaptcha();
    setCorrectAnswer(answer);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  }, []);

  const handleRefresh = () => {
    const answer = generateCaptcha();
    setCorrectAnswer(answer);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    const isValid = value.trim() === correctAnswer;
    setIsVerified(isValid);
    onVerify(isValid);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Защита от спама *
      </label>
      
      <div className="flex items-center space-x-3">
        {/* Капча */}
        <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-lg border">
          <span className="font-mono text-lg font-bold text-gray-800 select-none">
            {captchaText} = ?
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Обновить капчу"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Поле ввода */}
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className={`w-20 px-3 py-3 border rounded-lg text-center font-mono focus:outline-none focus:ring-2 transition-colors ${
            userInput.trim() === '' 
              ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              : isVerified 
                ? 'border-green-500 bg-green-50 focus:ring-green-500' 
                : 'border-red-500 bg-red-50 focus:ring-red-500'
          }`}
          placeholder="?"
          maxLength={3}
        />
        
        {/* Индикатор */}
        {userInput.trim() !== '' && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isVerified ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <span className="text-white text-sm font-bold">
              {isVerified ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Решите простой пример, чтобы подтвердить, что вы не робот
      </p>
    </div>
  );
};

export default SimpleCaptcha;