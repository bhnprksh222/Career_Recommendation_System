import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Questions.css';

const Questions = () => {
    const navigate = useNavigate();  // Hook for navigation
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [step, setStep] = useState(1); // Track question number

    // Fetch first question on load
    useEffect(() => {
        setStep(0);
        fetchQuestion();
    }, []);

    const fetchQuestion = async () => {
      try {
          const response = await axios.get("http://127.0.0.1:8000/get-question/");
          console.log("fetchQuestion Full API Response:", response.data); // Debugging
  
          const text = response.data.question.content;
          console.log("Extracted Question:", text);
  
          if (typeof text !== "string") {
              throw new Error("Invalid response format: Expected a string");
          }
  
          // Extract question and options
          const parsedOptions = text.match(/[A-D]\) (.+)/g) || [];
          setQuestion(text.split("A)")[0].trim()); // First part is the question
          setOptions(parsedOptions);
      } catch (error) {
          console.error("Error fetching question:", error);
      }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOption) {
        alert("Please select an option!");
        return;
    }

    try {
        const response = await axios.post("http://127.0.0.1:8000/submit-answer/", {
            selected_option: selectedOption
        });

        if (response.data.careers) {
            navigate('/result', { state: { careers: response.data.careers } });
        } else {
            const text = response.data.question.content;
            console.log("Full API Response:", response.data); 
            if (typeof text === "string") {
                setQuestion(text.split("A)")[0].trim());
                setOptions(text.match(/[A-D]\) (.+)/g) || []);
            } else {
                console.error("Invalid question format received:", text);
            }
            setSelectedOption('');
            setStep(step + 1);
        }
    } catch (error) {
        console.error("Error submitting answer:", error);
    }
  };

    return (
        <div className="questions-container">
            <header className="header">
                <h1 className="title"> 🤔 Career Quiz</h1>
                <p className="subtitle">Answer {19 - step + 1} more questions to get your career recommendations!</p>
            </header>

            <form className="question-form" onSubmit={handleSubmit}>
                <h2>{question}</h2>
                {options.map((option, index) => (
                    <div className="option" key={index}>
                        <input
                            type="radio"
                            id={`option${index}`}
                            name="careerOption"
                            value={option}
                            checked={selectedOption === option}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        <label htmlFor={`option${index}`}>{option}</label>
                    </div>
                ))}
                <button className="submit-button" type="submit">Next</button>
            </form>
        </div>
    );
};

export default Questions;