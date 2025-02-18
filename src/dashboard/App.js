import { useState } from '@wordpress/element';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the library
import './MainApp.scss';

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateContent = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = autoblog_data.api_key; // Get API key (make sure it's available)

            if (!apiKey) {
                throw new Error("Gemini API key is missing. Please configure it in the plugin settings.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or "gemini-2.0-flash" if available

            const result = await model.generateContent(prompt);

            if (result && result.response && result.response.text) {
                setGeneratedContent(result.response.text);
            } else {
                console.error("Unexpected response format:", result);
                throw new Error("Invalid response from Gemini API.");
            }



        } catch (err) {
            console.error("Error generating content:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of your component code (JSX, input, button, display)
    return (
        <>
            <h1>
                AutoBlog AI Application - Gemini API - Gen AI
            </h1>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows="5" // Adjust as needed
            />
            <button onClick={handleGenerateContent} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
            {error && <div className="error">{error}</div>} {/* Display error message */}
            {generatedContent && (
                <div className="generated-content">
                    <h2>Generated Content:</h2>
                    <p>{generatedContent}</p>
                </div>
            )}
        </>
    );
};


export default App;
