import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [mbtiCharacters, setMbtiCharacters] = useState([]);
  const [animalLogic, setAnimalLogic] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthdate, setBirthdate] = useState('');
  const [showBirthdateInput, setShowBirthdateInput] = useState(false);

  useEffect(() => {
    // 静的ファイルからデータを読み込み
    Promise.all([
      fetch('/data/questions.json').then(res => res.json()),
      fetch('/data/mbti_characters.json').then(res => res.json()),
      fetch('/data/animal_logic.json').then(res => res.json())
    ])
    .then(([questionsData, charactersData, animalData]) => {
      setQuestions(questionsData);
      setMbtiCharacters(charactersData);
      setAnimalLogic(animalData);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error loading data:", error);
      setError("データの読み込みに失敗しました。");
      setLoading(false);
    });
  }, []);

  const handleAnswer = (questionId, selectedOptionText) => {
    setAnswers([...answers, { questionId, selectedOptionText }]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowBirthdateInput(true);
    }
  };

  const handleBirthdateChange = (e) => {
    setBirthdate(e.target.value);
  };

  const analyzePersonality = () => {
    if (!birthdate) {
      alert("生年月日を入力してください。");
      return;
    }

    // クライアントサイドでMBTI分析
    let mbti_scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        const selectedOption = question.options.find(opt => opt.text === answer.selectedOptionText);
        if (selectedOption && selectedOption.mbti_trait) {
          mbti_scores[selectedOption.mbti_trait]++;
        }
      }
    });

    const mbti_result =
      (mbti_scores.E >= mbti_scores.I ? 'E' : 'I') +
      (mbti_scores.N >= mbti_scores.S ? 'N' : 'S') +
      (mbti_scores.T >= mbti_scores.F ? 'T' : 'F') +
      (mbti_scores.J >= mbti_scores.P ? 'J' : 'P');

    const mbti_character = mbtiCharacters.find(char => char.type === mbti_result);

    // 動物占い判定
    let animal_info_from_birthdate = null;
    if (birthdate) {
      const formattedBirthdate = birthdate.replace(/-/g, '/');
      animal_info_from_birthdate = animalLogic[formattedBirthdate] || null;
    }

    setResult({
      mbti_type: mbti_result,
      mbti_character: mbti_character || null,
      animal_info_from_birthdate: animal_info_from_birthdate
    });
  };

  if (loading) {
    return <div className="App">読み込み中...</div>;
  }

  if (error) {
    return <div className="App" style={{ color: 'red' }}>エラー: {error}</div>;
  }

  if (result) {
    const animalInfo = result.animal_info_from_birthdate;
    const animalDescriptionHtml = animalInfo && animalInfo.結果 ? animalInfo.結果.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    )) : null;

    const animalHappyApproachHtml = animalInfo && animalInfo.喜ぶ接し方 ? animalInfo.喜ぶ接し方.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    )) : null;

    const animalUniquePointHtml = animalInfo && animalInfo.ユニークポイント ? animalInfo.ユニークポイント.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    )) : null;

    // 色のテキスト名をCSSの色名にマッピング
    const colorMap = {
      "レッド": "red",
      "ブルー": "blue",
      "グリーン": "green",
      "イエロー": "yellow",
      "オレンジ": "orange",
      "パープル": "purple",
      "ブラウン": "brown",
      "ブラック": "black",
      "シルバー": "silver",
      "ゴールド": "gold"
    };

    const animalImageMap = {
      "猿": "monkey",
      "ライオン": "lion",
      "黒ひょう": "blackpanther",
      "虎": "tiger",
      "チータ": "cheetah",
      "たぬき": "raccoondog",
      "狼": "wolf",
      "子守熊": "koala",
      "こじか": "fawn",
      "ゾウ": "elephant",
      "ひつじ": "sheep",
      "ペガサス": "pegasus"
    };

    return (
      <div className="App">
        <h1>診断結果</h1>
        <div className="result-container">
          <div className="result-card mbti-result-card">
            <h2>あなたの簡易MBTIタイプ</h2>
            <p className="character-name">{result.mbti_type}</p>
            {result.mbti_type && (
              <div className="character-image">
                <img src={`/images/${result.mbti_type.replace(/\s/g, '')}.png`} alt={result.mbti_type} />
              </div>
            )}
            {result.mbti_character && (
              <>
                <h3>{result.mbti_character.name}</h3>
                <p className="description-title">特徴:</p>
                <p>{result.mbti_character.description}</p>
              </>
            )}
          </div>

          {animalInfo && (
            <div className="result-card animal-result-card">
              <h2>あなたの動物タイプ</h2>
              <p className="animal-name">{animalInfo.動物}</p>
              <div className="animal-image">
                <img src={`/images/${animalImageMap[animalInfo.動物]}.png`} alt={animalInfo.動物} />
              </div>
              {animalInfo.色 && (
                <div className="animal-detail-section">
                  <p className="description-title">色:</p>
                  <p>
                    {animalInfo.色}
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: colorMap[animalInfo.色] || animalInfo.色 }}
                    ></span>
                  </p>
                </div>
              )}
              {animalInfo['キャラクターを一言で'] && (
                <div className="animal-detail-section">
                  <p className="description-title">キャラクターを一言で:</p>
                  <p>{animalInfo['キャラクターを一言で']}</p>
                </div>
              )}
              {animalDescriptionHtml && (
                <div className="animal-detail-section">
                  <p className="description-title">特徴:</p>
                  <p>{animalDescriptionHtml}</p>
                </div>
              )}
              {animalUniquePointHtml && (
                <div className="animal-detail-section">
                  <p className="description-title">ユニークポイント:</p>
                  <p>{animalUniquePointHtml}</p>
                </div>
              )}
              {animalInfo['喜ぶ一言'] && (
                <div className="animal-detail-section">
                  <p className="description-title">心に響く言葉:</p>
                  <p>{animalInfo['喜ぶ一言']}</p>
                </div>
              )}
              {animalHappyApproachHtml && (
                <div className="animal-detail-section">
                  <p className="description-title">関係を深めるヒント:</p>
                  <p>{animalHappyApproachHtml}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => window.location.reload()}>もう一度診断する</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="App">
      <h1>性格分析ゲーム</h1>
      {!showBirthdateInput ? (
        <div className="question-container">
          <h2>{currentQuestion.question}</h2>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, option.text)}
                className="option-button"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="birthdate-input-container">
          <h2>生年月日を入力してください</h2>
          <input
            type="date"
            value={birthdate}
            onChange={handleBirthdateChange}
            className="birthdate-input"
          />
          <button onClick={analyzePersonality}>診断する</button>
        </div>
      )}
      {!showBirthdateInput && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      )}
      {!showBirthdateInput && <p>{currentQuestionIndex + 1} / {questions.length}</p>}
    </div>
  );
}

export default App;

