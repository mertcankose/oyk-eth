import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { arbitrum, mainnet, goerli } from '@reown/appkit/networks'
import { useState } from 'react';
import oyklogo from "./assets/oyk-logo.png"

const projectId = '415b280d7f14fd394fac17ffed28e6db';

const networks = [goerli, mainnet, arbitrum];

const metadata = {
  name: 'oyk-dapp',
  description: 'Oyk Dapp',
  url: 'https://oykdapp.mertcankose.com/',
  icons: ['https://oykdapp.mertcankose.com/oykdapp.png']
}

createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true
  }
})

const App = () => {
  const { address, isConnected } = useAppKitAccount();

  const [questions] = useState([
    {
      id: 1,
      author: "0x1234567890123456789012345678901234567890",
      content: "Ethereum'da gas fee nasıl hesaplanır?",
      timestamp: 1706712000,
      answerIds: [1, 2, 3]
    },
    {
      id: 2,
      author: "0x2345678901234567890123456789012345678901",
      content: "Smart contract deployment maliyeti nedir?",
      timestamp: 1706798400,
      answerIds: [4, 5, 6]
    }
  ]);

  const [answers] = useState([
    {
      id: 1,
      questionId: 1,
      author: "0x3456789012345678901234567890123456789012",
      content: "Gas fee = gas limit * gas price formülü ile hesaplanır.",
      upvotes: 4
    },
    {
      id: 2,
      questionId: 1,
      author: "0x4567890123456789012345678901234567890123",
      content: "Ağın yoğunluğuna göre değişir.",
      upvotes: 2
    },
    {
      id: 3,
      questionId: 1,
      author: "0x5678901234567890123456789012345678901234",
      content: "Base fee + priority fee şeklinde hesaplanır.",
      upvotes: 0
    },
    {
      id: 4,
      questionId: 2,
      author: "0x6789012345678901234567890123456789012345",
      content: "Kontratın büyüklüğüne göre değişir.",
      upvotes: 4
    },
    {
      id: 5,
      questionId: 2,
      author: "0x7890123456789012345678901234567890123456",
      content: "Optimization flags kullanarak maliyeti düşürebilirsiniz.",
      upvotes: 2
    },
    {
      id: 6,
      questionId: 2,
      author: "0x8901234567890123456789012345678901234567",
      content: "Test ağlarında ücretsizdir.",
      upvotes: 0
    }
  ]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
   

    <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <img src={oyklogo} alt="OYK Logo" className="h-20" />
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-medium bg-blue-50 px-4 py-1 rounded-full">
              ETH Balance: 1.234 ETH
            </p>
            <p className="text-sm font-medium bg-blue-50 px-4 py-1 rounded-full">
              OYK Balance: 100 OYK
            </p>
          </div>
          <appkit-button balance="show" label='Cüzdan Bağla' size="md" loadingLabel='Bağlanıyor..'  />
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Question Input */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <textarea 
          className="w-full p-4 border-2 border-gray-100 rounded-xl mb-4 resize-none focus:outline-none focus:border-[#0F9AF4] focus:ring-2 focus:ring-[#0F9AF4] focus:ring-opacity-20 transition-all"
          placeholder="Sorunuzu buraya yazın..."
          rows={3}
        />
        <div className="flex justify-end">
          <button className="bg-[#0F9AF4] text-white px-8 py-3 rounded-xl hover:bg-[#0F9AF4]/90 transition-all font-medium shadow-lg shadow-[#0F9AF4]/20">
            Soru Sor
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-[#0F9AF4]/10 px-4 py-1 rounded-full">
                  <p className="text-sm text-[#0F9AF4] font-medium">
                    {formatAddress(question.author)}
                  </p>
                </div>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-500">
                  {formatDate(question.timestamp)}
                </p>
              </div>
              <h3 className="text-xl font-medium text-gray-800">{question.content}</h3>
            </div>

            {/* Answers */}
            <div className="space-y-4 pl-6 border-l-2 border-[#0F9AF4]/20">
              {answers
                .filter(answer => answer.questionId === question.id)
                .map(answer => (
                  <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="bg-[#0F9AF4]/10 px-3 py-1 rounded-full inline-block mb-2">
                          <p className="text-sm text-[#0F9AF4] font-medium">
                            {formatAddress(answer.author)}
                          </p>
                        </div>
                        <p className="text-gray-700">{answer.content}</p>
                      </div>
                      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#0F9AF4] transition-colors">
                        <span className="text-xl">▲</span>
                        <span className="font-medium">{answer.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Answer Input */}
            <div className="mt-6 pl-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cevabınızı yazın..."
                  className="w-full p-4 pr-24 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F9AF4] focus:ring-2 focus:ring-[#0F9AF4]/20 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F9AF4] text-white px-4 py-2 rounded-lg hover:bg-[#0F9AF4]/90 transition-all text-sm font-medium">
                  Cevapla
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>

  )
}

export default App;