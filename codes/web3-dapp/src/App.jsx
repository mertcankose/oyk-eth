import {
  createAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { useEffect, useState } from "react";
import oyklogo from "./assets/oyk-logo.png";
import { tokenAbi, questionAnswerAbi } from "./assets/abis";
import { ethers, formatUnits } from "ethers";
import { BrowserProvider } from "ethers";
import { format } from "date-fns";

/* WALLET KIT AYARLARI (HER WALLET PAKETİNE GÖRE DEĞİŞİKLİK GÖSTEREBİLİR) */
const projectId = "415b280d7f14fd394fac17ffed28e6db";
const networks = [sepolia, mainnet];
const metadata = {
  name: "oyk-dapp",
  description: "Oyk Dapp",
  url: "https://oykdapp.mertcankose.com/",
  icons: ["https://oykdapp.mertcankose.com/oykdapp.png"],
};
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});
/* WALLET KIT AYARLARI (HER WALLET PAKETİNE GÖRE DEĞİŞİKLİK GÖSTEREBİLİR) */

const App = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [ethBalance, setEthBalance] = useState("0");
  const [oykBalance, setOykBalance] = useState("0");

  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [questionAnswerContract, setQuestionAnswerContract] = useState(null);

  // QUESTION, ANSWER
  const [questionCount, setQuestionCount] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newAnswerContents, setNewAnswerContents] = useState({});

  // LOADINGS
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [isAnswersLoading, setIsAnswersLoading] = useState(false);
  const [isUpvoteLoading, setIsUpvoteLoading] = useState({});
  const [isSubmitQuestionLoading, setIsSubmitQuestionLoading] = useState(false);
  const [isSubmitAnswerLoading, setIsSubmitAnswerLoading] = useState({});

  const OYK_TOKEN_ADDRESS = "0x3E4EF6dfc4565B92C4a4e60897079925E85A615E";
  const QUESTION_ANSWER_ADDRESS = "0xCf1bCC08a9e2f7216Fc0717e16De67285D610C54";

  /* DEFINE PROVIDER */
  useEffect(() => {
    if (isConnected && walletProvider) {
      const newProvider = new BrowserProvider(walletProvider);
      setProvider(newProvider);
    } else {
      setProvider(null);
    }
  }, [isConnected, walletProvider]);

  /* INITIALIZE CONTRACTS */
  useEffect(() => {
    initContracts();
  }, [address, tokenAbi, questionAnswerAbi, isConnected, provider]);

  useEffect(() => {
    if (isConnected && walletProvider && questionAnswerContract) {
      loadQuestions();
    }
  }, [isConnected, walletProvider, questionAnswerContract]);

  /* INITIALIZE CONTRACTS */
  const initContracts = async () => {
    try {
      if (!isConnected || !provider) {
        setTokenContract(null);
        setQuestionAnswerContract(null);
        return;
      }

      const signer = await provider.getSigner();
      const newTokenContract = new ethers.Contract(
        OYK_TOKEN_ADDRESS,
        tokenAbi,
        signer
      );
      const newQuestionAnswerContract = new ethers.Contract(
        QUESTION_ANSWER_ADDRESS,
        questionAnswerAbi,
        signer
      );

      setTokenContract(newTokenContract);
      setQuestionAnswerContract(newQuestionAnswerContract);
    } catch (err) {
      setTokenContract(null);
      setQuestionAnswerContract(null);
    } finally {
    }
  };

  useEffect(() => {
    if (isConnected && provider && tokenContract) {
      fetchBalances();
    }
  }, [isConnected, provider, tokenContract, address]);

  const fetchBalances = async () => {
    try {
      if (!isConnected || !provider || !tokenContract) return;

      const ethBal = await provider.getBalance(address);
      const tokenBal = await tokenContract.balanceOf(address);

      setEthBalance(ethers.formatEther(ethBal));
      setOykBalance(ethers.formatEther(tokenBal));
    } catch (err) {
      console.error("Balance fetch error:", err);
      setEthBalance("0");
      setOykBalance("0");
    }
  };

  const loadQuestions = async () => {
    setIsQuestionsLoading(true);
    try {
      const questions = await questionAnswerContract.getQuestions();
      setQuestions(questions);
      setIsAnswersLoading(true);
      const allAnswers = [];
      // her soru için ayrı ayrı cevapları yükle
      for (const question of questions) {
        const answers = await questionAnswerContract.getAnswersForQuestion(
          question.id
        );
        allAnswers.push(...answers);
      }
      setAnswers(allAnswers);
    } catch (err) {
      console.error("Load questions error:", err);
    } finally {
      setIsQuestionsLoading(false);
      setIsAnswersLoading(false);
    }
  };

  const createQuestion = async () => {
    setIsSubmitQuestionLoading(true);
    try {
      const tx = await questionAnswerContract.createQuestion(
        newQuestionContent
      );
      await tx.wait();
      setNewQuestionContent("");
      loadQuestions();
    } catch (err) {
      console.error("Create question error:", err);
    } finally {
      setIsSubmitQuestionLoading(false);
    }
  };

  const createAnswer = async (questionId) => {
    setIsSubmitAnswerLoading((prev) => ({ ...prev, [questionId]: true }));
    try {
      const content = newAnswerContents[questionId];
      const tx = await questionAnswerContract.createAnswer(questionId, content);
      await tx.wait();
      setNewAnswerContents((prev) => ({ ...prev, [questionId]: "" }));
      loadQuestions();
    } catch (err) {
      console.error("Create answer error:", err);
    } finally {
      setIsSubmitAnswerLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    setIsUpvoteLoading((prev) => ({ ...prev, [answerId]: true }));
    try {
      const approveTx = await tokenContract.approve(
        QUESTION_ANSWER_ADDRESS,
        ethers.parseEther("10")
      );
      await approveTx.wait();

      const tx = await questionAnswerContract.upvoteAnswer(answerId);
      await tx.wait();

      loadQuestions();
      fetchBalances();
    } catch (err) {
      console.error("Upvote error:", err);
    } finally {
      setIsUpvoteLoading((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row justify-between items-center">
          <img src={oyklogo} alt="OYK Logo" className="h-20" />
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-medium bg-blue-50 px-4 py-1 rounded-full">
                ETH Balance: {Number(ethBalance).toFixed(4)} ETH
              </p>
              <p className="text-sm font-medium bg-blue-50 px-4 py-1 rounded-full">
                OYK Balance: {Number(oykBalance).toFixed(2)} OYK
              </p>
            </div>
            <appkit-button
              balance="show"
              label="Cüzdan Bağla"
              size="md"
              loadingLabel="Bağlanıyor.."
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Question Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <textarea
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            className="w-full p-4 border-2 border-gray-100 rounded-xl mb-4"
            placeholder="Sorunuzu buraya yazın..."
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={createQuestion}
              className="bg-[#0F9AF4] text-white px-8 py-3 rounded-xl"
            >
              {isSubmitQuestionLoading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
              ) : (
                "Soru Sor"
              )}
            </button>
          </div>
        </div>

        {isQuestionsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F9AF4]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#0F9AF4]/10 px-4 py-1 rounded-full">
                      <p className="text-xs text-[#0F9AF4] font-medium">
                        {question.author}
                      </p>
                    </div>
                    <span>•</span>
                    <p className="text-sm text-gray-500">
                    {format(Number(formatUnits(question.timestamp, 0)) * 1000, "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800">
                    {question.content}
                  </h3>
                </div>

                <div className="space-y-4 pl-6 border-l-2">
                  {answers
                    .filter((a) => a.questionId === question.id)
                    .map((answer) => (
                      <div
                        key={answer.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="bg-[#0F9AF4]/10 px-3 py-1 rounded-full inline-block mb-2">
                              <p className="text-xs text-[#0F9AF4] font-medium">
                                {answer.author}
                              </p>
                            </div>
                            <p className="text-gray-700">{answer.content}</p>
                          </div>
                          <button
                            onClick={() => handleUpvoteAnswer(answer.id)}
                            className="flex flex-col items-center gap-1"
                          >
                            {isUpvoteLoading[answer.id] ? (
                              <div className="animate-spin h-4 w-4 border-t-2 border-[#0F9AF4] rounded-full"></div>
                            ) : (
                              <>
                                <span className="text-xl">▲</span>
                                <span className="font-medium">
                                  {Number(answer.upvotes)}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 pl-6">
                  <div className="relative">
                    <input
                      value={newAnswerContents[question.id] || ""}
                      onChange={(e) =>
                        setNewAnswerContents((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      placeholder="Cevabınızı yazın..."
                      className="w-full p-4 pr-24 bg-gray-50 rounded-xl"
                    />
                    <button
                      onClick={() => createAnswer(question.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F9AF4] text-white px-4 py-2 rounded-lg"
                    >
                      {isSubmitAnswerLoading[question.id] ? (
                        <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></div>
                      ) : (
                        "Cevapla"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
