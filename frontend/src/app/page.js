'use client'
import { useEffect, useState } from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import pdfToText from 'react-pdftotext'


export default function Home() {
  const [cur, setCur] = useState(0);
  const [data, setData] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mainText, setMainText] = useState('');
  const [days_left, setDaysLeft] = useState(1);
  const [answers, setAnswers] = useState('');

  const API_KEY = '3f2d0eb3-ea3f-4057-ae18-3f81485a661a'; 
  const LIMIT = 10;
  const [session_id , setSessionId] = useState(''); 
  const [pdftext, setPdftext] = useState("");

  function extractText(event) {
    setLoading(true);
    const file = event.target.files[0]
    pdfToText(file)
        .then(text => {console.log(text); 
                       setPdftext(text) ; 
                       setLoading(false)} )
        .catch(error => console.error("Failed to extract text from pdf"))
}

  async function resume_analyze() {
    setLoading(true);
    try {
      const response = await fetch(
        `http:///127.0.0.1:8000/resume_analysis?session_id=${encodeURIComponent(session_id)}&resume=${encodeURIComponent(pdftext)}`
      ,{
        headers: {
          'accept' : 'application/json',
        },
      });
      if(response.ok){
        const responseData = await response.json();
        setMainText(responseData.answer);
        setLoading(false);
        setStep(3);
        return responseData;
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }
  
  async function skill_analyze() {
    setLoading(true);
    console.log(session_id)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/skill_analysis?answers=${encodeURIComponent(answers)}&session_id=${encodeURIComponent(session_id)}&days_left=${(days_left)}`
      ,{
        headers: {
          'accept' : 'application/json',
        },
      });
      if(response.ok){
        const responseData = await response.json();
        setMainText(responseData.answer);
        setLoading(false);
        setStep(2);
        return responseData;
      } else {
        console.log('HTTP-Error: ' + response.status);
      }
    }
    catch (error) {
      console.error('Error during fetch:', error);
    }
  }

  async function initiate() {
    console.log(session_id)
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/initiate?job_description=${encodeURIComponent(data[cur].description)}&session_id=${encodeURIComponent(session_id)}`
      ,{
        headers: {
          'accept' : 'application/json',
        },
      });
    
      if (response.ok) {
        const responseData = await response.json();
        setMainText(responseData.answer);
        setStep(1);
        setLoading(false);
        return responseData;
      } else {
        console.log('HTTP-Error: ' + response.status);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }


  async function crackeddevs() {
    const response = await fetch(
      `https://api.crackeddevs.com/v1/get-jobs?limit=${LIMIT}`,
      {
        headers: {
          'api-key': `${API_KEY}`, // API KEY HERE
        },
      }
    );
  
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setData(data);
      setMainText(data[0].description);
      return data;
    } else {
      console.log('HTTP-Error: ' + response.status);
    }
  }
  
  useEffect(() => {
    crackeddevs();
    setSessionId(Math.random().toString(36).substring(7))
  }, []);

  return (
    <main className="flex h-screen items-center justify-between">
      <div className="scrollbar-thumb-sky-800 scrollbar-track-zinc-800 scrollbar-thin items-center bg-slate-900 h-full w-1/3 p-5 overflow-y-scroll">

    {data.map((item, index) => (
      <div className={`card w-full min-h-[200px] h-fit bg-slate-800 rounded-lg p-3 my-3
                      hover:scale-105 transition duration-300 ease-in-out cursor-pointer shadow-lg
                      ${cur === index ? "bg-slate-950" : ""}
      `}
      onClick={() => {setCur(index) ; setStep(0) , setMainText(item.description)}}
      >
        <div className="flex">
          <img className="rounded-full w-[50px] h-[50px]" src={item.logo_url || "https://fastly.picsum.photos/id/704/200/200.jpg?hmac=kJOOLetUU-CUDBZJ8Y1l52dL4qYp9QRAKpQC8OsyOSo"} alt="logo" />
          <div className="header-right px-3">
          <h1 className="text-xl font-bold text-white">{item.title}</h1>
            <p className="text-sm text-slate-400">{item.job_type}</p>
          </div>
        </div>

        <div className="below-part justify-between p-5 text-slate-300 text-sm">
           <div className="p-1"> 💰 {item.max_payment_usd ? "$" + item.max_payment_usd : " Not Disclosed"} </div> 
           <div className="p-1"> 🤹‍♂️ {item.technologies.map((techs)=> (<> {techs} |</>))} </div>
            <div className="p-1"> 📅 {new Date(item.deadline).toDateString()} </div> 
        </div>
        </div>)
    )}



      </div>


      <div className="items-center bg-slate-950 h-full w-2/3 p-5 overflow-y-auto scrollbar-thumb-sky-800 scrollbar-track-zinc-800 scrollbar-thin">
        <div className="text-2xl font-bold text-white py-3 w-full"> 
        {data[cur] && data[cur].title} 
        {/* link to apply now page */}
        {data[cur] && <a target="_blank" href={data[cur].apply_url} className="bg-green-900 p-2 rounded-full text-sm ml-4 px-5" >Apply</a >}
        </div>
        <div className="description w-full min-h-[200px] h-fit text-slate-200 bg-slate-800 rounded-t-lg p-3">
          
      
      {loading ? <div class='flex space-x-2 justify-center items-center h-[40rem]'>
          <div className='h-8 w-8 rounded-full animate-bounce [animation-delay:-0.3s]'>
            🔴
          </div>
          <div className='h-8 w-8 rounded-full animate-bounce [animation-delay:-0.15s]'>
            🟡
          </div>
          <div className='h-8 w-8 rounded-full animate-bounce'>
            🔵
          </div>
      </div>         
          : <Markdown remarkPlugins={[remarkGfm]}>{mainText}</Markdown>}        

          
            
      </div>
      
      { step === 0 && (<>
      <div onClick={()=> initiate()}
      className="bg-green-800 w-full  p-3 text-center rounded-b-lg cursor-pointer"> START EVALUATION </div>     
      </>)}

        { step === 1 && (<>
      <div className="bg-zinc-900 p-3 flex text-xs text-center text-slate-400"> {days_left} Days Left (Estimated) <input type='range' className="p-5 w-full" min='1' max='90' value={days_left} onChange={(e)=>{setDaysLeft(e.target.value)}}/>  </div>
      <textarea type="textarea" className="w-full h-40 p-3 bg-zinc-900" placeholder="Write your answer here" 
      onChange={(e)=>{setAnswers(e.target.value)}}/>
      <div onClick={()=> skill_analyze()}
      className="bg-green-800 w-full  p-3 text-center rounded-b-lg cursor-pointer"> PREPARE ROADMAP </div>     
      </>)}

      { step === 2 && (
         <>
         <div  className="w-full  bg-slate-900 p-3 text-sm"> Upload Your Resume <input type="file" accept="application/pdf" onChange={extractText}/></div>
         <div onClick={resume_analyze} className="bg-green-800 w-full p-3 text-center rounded-b-lg cursor-pointer"> RESUME MODIFICATION SUGGESTION </div>
        </>
      )}


      </div>
    </main>
  );
}
