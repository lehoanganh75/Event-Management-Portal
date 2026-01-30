import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound404 = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 p-6'>
      <div className='max-w-4xl w-full bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2'>
        <div className='relative flex items-center justify-center p-8 md:p-12 bg-gradient-to-tr from-white to-blue-50'>
          <svg
            className='absolute -top-10 -left-10 w-44 opacity-40 animate-floatSlow'
            viewBox='0 0 200 200'
          >
            <defs>
              <linearGradient id='g1' x1='0%' x2='100%'>
                <stop offset='0%' stopColor='#60A5FA' />
                <stop offset='100%' stopColor='#A78BFA' />
              </linearGradient>
            </defs>
            <circle cx='50' cy='50' r='50' fill='url(#g1)' />
          </svg>
          <div className='w-full max-w-sm'>
            <svg viewBox='0 0 480 360' className='w-full h-auto'>
              <g transform='translate(80,40)'>
                <ellipse
                  cx='160'
                  cy='260'
                  rx='110'
                  ry='28'
                  fill='#111827'
                  opacity='0.08'
                />
                <g
                  className='transform-gpu'
                  style={{ transformOrigin: '160px 160px' }}
                >
                  <rect
                    x='90'
                    y='40'
                    rx='22'
                    ry='22'
                    width='140'
                    height='140'
                    fill='#eef2ff'
                    stroke='#c7d2fe'
                    strokeWidth='4'
                  />
                  <g className='translate-y-0 animate-bob'>
                    <rect
                      x='120'
                      y='70'
                      rx='16'
                      ry='16'
                      width='80'
                      height='54'
                      fill='#111827'
                      opacity='0.92'
                    />
                    <rect
                      x='132'
                      y='80'
                      rx='10'
                      ry='10'
                      width='56'
                      height='28'
                      fill='#ffffff'
                      opacity='0.06'
                    />
                  </g>
                  <line
                    x1='160'
                    y1='16'
                    x2='160'
                    y2='40'
                    stroke='#c7d2fe'
                    strokeWidth='6'
                    strokeLinecap='round'
                  />
                  <circle cx='160' cy='12' r='8' fill='#7c3aed' />
                </g>
                <g className='animate-orbit' transform='translate(60,40)'>
                  <circle cx='80' cy='30' r='8' fill='#60a5fa' />
                </g>
              </g>
            </svg>
          </div>

          <div className='absolute bottom-6 left-6 text-sm text-slate-500'>
            Không tìm thấy trang — nhưng robot đang cố gắng tìm.
          </div>
        </div>
        <div className='p-8 md:p-12 flex flex-col justify-center'>
          <h1 className='text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600'>
            404
          </h1>
          <h2 className='mt-2 text-2xl font-semibold text-slate-800'>
            Trang bạn tìm không tồn tại
          </h2>
          <p className='mt-4 text-slate-600 leading-relaxed'>
            Có thể đường dẫn bị sai, hoặc trang đã được di chuyển. Thử quay lại
            trang chủ hoặc kiểm tra URL một lần nữa.
          </p>

          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => navigate(-1)}
              className='px-5 py-3 rounded-lg bg-white border border-slate-200 hover:shadow-md transition shadow-sm'
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate('/')}
              className='px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 text-white font-semibold hover:brightness-105 transition'
            >
              Về trang chủ
            </button>
          </div>

          <div className='mt-8 text-xs text-slate-400'>
            Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ admin hoặc thử tải lại
            trang sau.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bob {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(0) rotate(0deg); }
          50% { transform: rotate(180deg) translateX(0) rotate(-180deg); }
          100% { transform: rotate(360deg) translateX(0) rotate(-360deg); }
        }
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-bob { animation: bob 3s ease-in-out infinite; }
        .animate-orbit { transform-origin: 80px 80px; animation: orbit 6s linear infinite; }
        .animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotFound404;
