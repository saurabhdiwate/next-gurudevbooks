"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import developerImage from '../assets/AS.webp';

const AboutUs: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-30">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">इस एप की कहानी</h1>
          </div>
        </div>
      </div>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🙏</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">हमें बहुत खुशी है कि आप गुरुदेव बुक्स ऐप से जुड़ रहे हैं!</h2>
            </div>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
              <p className="text-lg">यह ऐप परम पूज्य गुरुदेव श्रीराम शर्मा आचार्य के विचारों को जन-जन तक पहुँचाने के एक मिशन का हिस्सा है।</p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <p className="text-lg">इसी प्रेरणा से, मैंने और मेरे भाई आलोक ने यह ऐप बनाने का फैसला किया।</p>
              </div>
              <p className="text-lg">जब हमने काम शुरू किया, तो गुरुदेव की कृपा से व्यापार में अद्भुत वृद्धि हुई।</p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-l-4 border-green-500">
                <p className="text-lg font-medium text-green-800">ऐसा लगा मानो गुरुदेव स्वयं कह रहे हों, "बेटा, तुम मेरा काम करो, मैं तुम्हारा काम करूँगा।"</p>
              </div>
              <p className="text-lg">यह ऐप गुरुदेव के विचारों को फैलाने का एक पवित्र माध्यम है।</p>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500 text-center">
                <p className="text-lg font-semibold text-orange-800">हमें उम्मीद है कि आप इस ऐप के माध्यम से गुरुदेव के ज्ञान और विचारों का भरपूर लाभ उठाएँगे</p>
              </div>
            </div>
            <div className="flex justify-center my-8">
              <img src={developerImage.src || (developerImage as any)} alt="Developer" className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-lg object-cover shadow-lg border-4 border-orange-200" />
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full">
                <span className="text-xl">🙏</span>
                <span className="font-semibold">जय गुरुदेव</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;