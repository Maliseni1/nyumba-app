import React, { useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import useSendMessage from '../../hooks/useSendMessage';

const MessageInput = () => {
    const [message, setMessage] = useState("");
    const { loading, sendMessage } = useSendMessage();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        await sendMessage(message);
        setMessage("");
    };
    return (
        <form className='px-4 my-3' onSubmit={handleSubmit}>
            <div className='w-full relative'>
                <input type='text' className='border text-sm rounded-lg block w-full p-2.5 bg-slate-700 border-slate-600 text-white' placeholder='Send a message' value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3 text-white' disabled={loading}>
                    {loading ? <div className='loading loading-spinner'></div> : <IoMdSend />}
                </button>
            </div>
        </form>
    );
};
export default MessageInput;