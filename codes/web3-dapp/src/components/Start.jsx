import {
    createAppKit,
    useAppKitAccount,
    useAppKitProvider,
  } from "@reown/appkit/react";
  import { EthersAdapter } from "@reown/appkit-adapter-ethers";
  import { mainnet, sepolia } from "@reown/appkit/networks";
  import { useEffect, useState } from "react";
  import oyklogo from "../assets/oyk-logo.png";
  import { tokenAbi, questionAnswerAbi } from "../assets/abis";
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
  
  const Start = () => {
    // CONTRACT ADDRESSES
    const OYK_TOKEN_ADDRESS = "";
    const QUESTION_ANSWER_ADDRESS = "";
  
    // CÜZDAN HESABI VE BİLGİLERİ
    const { walletProvider } = useAppKitProvider("eip155"); // provider tüm evm uyumlu blokzincirleri destekler
    const { address, isConnected } = useAppKitAccount();
  
    // ETHEREUM VE OYK TOKEN BAKİYELERİMİZ
    const [ethBalance, setEthBalance] = useState("0");
    const [oykBalance, setOykBalance] = useState("0");
  
    // PROVIDER (uygulama ile blockchain arasındaki iletişimi sağlayan bir arayüzdür. RPC'leri yönetir, smart contractlar ile etkileşime girer)
    const [provider, setProvider] = useState(null);
  
    // CONTRACTS
    const [tokenContract, setTokenContract] = useState(null);
    const [questionAnswerContract, setQuestionAnswerContract] = useState(null);
  
    // SORULAR VE CEVAPLAR
    const [questions, setQuestions] = useState([]); // SORULAR ARRAY
    const [answers, setAnswers] = useState([]); // CEVAPLAR ARRAY
    const [newQuestionContent, setNewQuestionContent] = useState(""); // YENİ SORU İÇERİĞİ
    const [newAnswerContents, setNewAnswerContents] = useState({}); // YENİ CEVAP İÇERİĞİ (SORU ID VE CEVAP İÇERİR)
  
    // YÜKLEME DURUMLARI
    const [isQuestionsLoading, setIsQuestionsLoading] = useState(false); // SORULAR YÜKLENİRKEN
    const [isAnswersLoading, setIsAnswersLoading] = useState(false); // CEVAPLAR YÜKLENİRKEN
    const [isUpvoteLoading, setIsUpvoteLoading] = useState({}); // UPVOTELAR YÜKLENİRKEN
    const [isSubmitQuestionLoading, setIsSubmitQuestionLoading] = useState(false); // SORU SORULURKEN YÜKLEME
    const [isSubmitAnswerLoading, setIsSubmitAnswerLoading] = useState({}); // CEVAP YAZILIRKEN YÜKLEME
  
  
    // PROVIDER (kullanıcı MetaMask'ı bağladığında veya bağlantıyı kestiğinde, uygulama durumunu buna göre güncelleyecektir.)
    useEffect(() => {
      
    }, [isConnected, walletProvider]); // Cüzdan bağlı mı ve walletProvider(metamask, coinbasewallet, rainbowwallet etc.) var mı?
  
    // CONTRACTLARI BAŞLATMA
    useEffect(() => {
      initContracts();
    }, [address, tokenAbi, questionAnswerAbi, isConnected, provider]);
  
    // SORULAR VE CEVAPLAR YÜKLENİRKEN
    useEffect(() => {
      if (isConnected && walletProvider && questionAnswerContract) {
        loadQuestions();
      }
    }, [isConnected, walletProvider, questionAnswerContract]);
  
    // CONTRACTLARI BAŞLATMA
    const initContracts = async () => {
      // Contractları başlat
    };
  
    // ETHEREUM VE OYK TOKEN BAKİYELERİMİZİ YÜKLEME
    useEffect(() => {
      if (isConnected && provider && tokenContract) {
        fetchBalances();
      }
    }, [isConnected, provider, tokenContract, address]);
  
    // ETHEREUM VE OYK TOKEN BAKİYELERİMİZİ YÜKLEME
    const fetchBalances = async () => {
      // Bakiyeleri yükle
    };
  
    // SORULAR VE CEVAPLAR YÜKLENİRKEN
    const loadQuestions = async () => {
        // Soruları yükle
    };
  
    // SORU SORULURKEN
    const createQuestion = async () => {
      // Soru oluşturun
    };
  
    // CEVAP YAZILIRKEN
    const createAnswer = async (questionId) => {
     // Cevap oluşturun
    };
  
    // CEVAPLARA UPVOTE YAPILIRKEN
    const handleUpvoteAnswer = async (answerId) => {
      // Upvote işlemini gerçekleştirin
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
                    <div className="flex flex-col lg:flex-row items-center gap-2 mb-3">
                      <div className="bg-[#0F9AF4]/10 px-4 py-1 rounded-full">
                        <p className="text-xs text-[#0F9AF4] font-medium">
                          {question.author}
                        </p>
                      </div>
                      <span>•</span>
                      <p className="text-sm text-gray-500">
                        {format(
                          Number(formatUnits(question.timestamp, 0)) * 1000,
                          "dd MMM yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800">
                      {question.content}
                    </h3>
                  </div>
  
                  <div className="space-y-4 pl-6 border-l-2">
                    {isAnswersLoading ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
                    ) : (
                      answers
                        .filter((a) => a.questionId === question.id)
                        .map((answer) => (
                          <div
                            key={answer.id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
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
                        ))
                    )}
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
  
  export default Start;
  