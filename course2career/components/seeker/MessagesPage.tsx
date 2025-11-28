import React, { useState } from 'react';
import { MailIcon } from '../icons/MailIcon';
import { UserIcon } from '../icons/UserIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SearchIcon } from '../icons/SearchIcon';

const mockConversations = [
  {
    id: 1,
    name: 'Alice Johnson',
    company: 'Innovate Inc.',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    lastMessage: 'Great, we\'d love to schedule an interview for next week.',
    time: '10:45 AM',
    unread: 2,
    messages: [
      { sender: 'other', text: 'Hi, thanks for applying! Your profile looks very promising.' },
      { sender: 'me', text: 'Thank you for the opportunity! I\'m very interested in the role.' },
      { sender: 'other', text: 'Great, we\'d love to schedule an interview for next week.' },
    ]
  },
  {
    id: 2,
    name: 'Bob Williams',
    company: 'Tech Solutions LLC',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    lastMessage: 'Can you tell me more about your final year project?',
    time: 'Yesterday',
    unread: 0,
     messages: [
      { sender: 'other', text: 'Hi there, following up on your application.' },
      { sender: 'other', text: 'Can you tell me more about your final year project?' },
    ]
  },
   {
    id: 3,
    name: 'Charlie Brown',
    company: 'DataDriven Co.',
    avatar: 'https://i.pravatar.cc/150?u=charlie',
    lastMessage: 'You: Okay, sounds good. I will be available...',
    time: '3 days ago',
    unread: 0,
     messages: [
      { sender: 'me', text: 'Okay, sounds good. I will be available...' },
    ]
  },
];


const MessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        
        const updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, { sender: 'me', text: newMessage }]
        };
        setSelectedConversation(updatedConversation);

        const updatedConversations = conversations.map(c => 
            c.id === updatedConversation.id ? updatedConversation : c
        );
        setConversations(updatedConversations);
        setNewMessage('');
    };

    return (
        <div className="bg-white dark:bg-secondary shadow-lg rounded-lg max-w-6xl mx-auto flex h-[75vh] animate-fade-in-up">
            {/* Sidebar with conversations */}
            <div className="w-1/3 border-r dark:border-secondary-focus flex flex-col">
                <div className="p-4 border-b dark:border-secondary-focus">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
                    <div className="relative mt-2">
                        <input type="text" placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 border dark:border-secondary-focus rounded-full bg-gray-100 dark:bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary dark:text-secondary-content" />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-base-content">
                            <SearchIcon className="w-5 h-5"/>
                        </div>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.map(convo => (
                        <div key={convo.id} 
                             onClick={() => setSelectedConversation(convo)}
                             className={`p-4 flex items-center cursor-pointer border-l-4 ${selectedConversation.id === convo.id ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-gray-100 dark:hover:bg-secondary-focus'}`}>
                            <img src={convo.avatar} alt={convo.name} className="w-12 h-12 rounded-full mr-4"/>
                            <div className="flex-grow">
                                <div className="flex justify-between">
                                    <p className="font-semibold text-gray-800 dark:text-secondary-content">{convo.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-base-content">{convo.time}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-base-content truncate">{convo.lastMessage}</p>
                            </div>
                            {convo.unread > 0 && <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{convo.unread}</span>}
                        </div>
                    ))}
                </div>
            </div>
            {/* Main chat window */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b dark:border-secondary-focus flex items-center bg-gray-50 dark:bg-secondary-focus rounded-tr-lg">
                            <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full mr-3"/>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</p>
                                <p className="text-sm text-gray-600 dark:text-base-content">{selectedConversation.company}</p>
                            </div>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-base-100">
                            <div className="space-y-4">
                                {selectedConversation.messages.map((msg, index) => (
                                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'other' && <img src={selectedConversation.avatar} className="w-8 h-8 rounded-full flex-shrink-0"/>}
                                        <p className={`px-4 py-2 rounded-2xl max-w-md ${msg.sender === 'me' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-secondary-focus text-gray-800 dark:text-secondary-content rounded-bl-none'}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t dark:border-secondary-focus bg-gray-50 dark:bg-secondary-focus rounded-br-lg">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-grow p-3 border border-gray-300 dark:border-secondary-focus/50 dark:bg-base-100 dark:text-secondary-content rounded-full focus:ring-primary focus:border-primary"
                                />
                                <button onClick={handleSendMessage} className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus disabled:bg-gray-400">
                                    <PaperAirplaneIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-base-content">
                        <MailIcon className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold">Select a conversation</h3>
                        <p>Choose a contact from the left to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;