"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import ChatComponent from "./ChatComponent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
  userId: string;
  message: {
    type: string;
    data: {
      content: string;
      name?: string | null;
      role?: string | null;
      additional_kwargs?: string | null;
    };
  };
}

const dummyData: Message[] = [
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Hi there! I'm preparing for my data structures and algorithms exam. Mind if I ask you a few questions?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "Of course not! Fire away with your questions.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Alright, first one: what's the time complexity of finding an element in a sorted array using binary search?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "That would be O(log n), where n is the number of elements in the array.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Great, got it! Now, which sorting algorithm has a worst-case time complexity of O(n^2)?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "That would be quicksort.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Hmm, interesting. And what about the primary use of Dijkstra's algorithm?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "Dijkstra's algorithm is primarily used for finding the shortest path in a weighted graph.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Excellent! Next up, what data structure uses LIFO (Last In, First Out) ordering?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "That would be a stack.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Okay, last one for now: what's the main disadvantage of using bubble sort?",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "The main disadvantage of bubble sort is its time complexity, which can be O(n^2) in the worst-case scenario.",
        "name": "Athena"
      }
    }
  },
  {
    "userId": "Person",
    "message": {
      "type": "Human",
      "data": {
        "content": "Thanks a bunch! You've been really helpful.",
        "name": "Student"
      }
    }
  },
  {
    "userId": "Chatbot",
    "message": {
      "type": "bot",
      "data": {
        "content": "Anytime! If you have more questions, feel free to ask. Good luck with your exam prep!",
        "name": "Athena"
      }
    }
  }
];

const ChatBot: React.FC = () => {
  const [chatData, setChatData] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const auth = useUser();
  const userId = auth.user?.id as string;

  useEffect(() => {
    const chat = document.getElementById("chat");
    chat?.scrollTo(0, chat.scrollHeight);
  }, [chatData.length]);

  const data = useQuery(api.messaging.list, { userId });

  console.log(data);

  const sendMessage = useMutation(api.messaging.send);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting");
    if (value !== "") {
      await sendMessage({ message: value, userId });
      setValue("");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 p-4 h-[70vh]">
        <div className="flex flex-col gap-2">
          {chatData.map((message, index) => (
            <ChatComponent
              isBot={message.message.type === "bot"}
              content={message.message.data.content}
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="flex h-full place-items-end justify-center my-2">
        <form className="flex items-center w-full" onSubmit={handleSubmit}>
          <Input
            className="flex-1 h-10 mx-2 focus:outline-none rounded-lg"
            placeholder="Type your message here"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button className="h-10 mx-3 rounded-r-lg" type="submit">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
