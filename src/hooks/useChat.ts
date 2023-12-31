import React, { useState, useEffect } from "react";
import {
  addDoc,
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

import { IMessage } from "@/components/inputpanel";
import { getAnswer } from "@/lib/chat";
import { systemTemplate } from "@/lib/template";
import { useAppSelector } from "@/lib/hooks";
import { firestore } from "@/lib/firebase";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages: IMessage[];
  onResponse: Function;
}

export function useChat({ initialMessages, onResponse }: ChatProps) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const globalData = useAppSelector((state) => state.common.globalData);

  async function addData(context: string, word: string) {
    const docData = {
      context,
      word,
      createdAt: Date.now(),
      deleted: false,
      updatedAt: Date.now(),
      userId: globalData.userCredential.user.uid,
    };
    const docRef = await addDoc(collection(firestore, "query"), docData);
    console.log("Document written with ID: ", docRef.id);
  }

  const append = async (message: IMessage) => {
    setIsLoading(true);
    setMessages((prevMessages) => [...prevMessages, message]);
    // 这里你可能还想添加其他逻辑，比如发送消息到服务器等 -> useEffect
  };

  useEffect(() => {
    if (messages[messages.length - 1].role === "HUMAN") {
      getAnswer([
        {
          role: "SYSTEM",
          content: systemTemplate,
        },
        ...messages,
      ])
        .then((answer) => {
          answer &&
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                role: "AI_ANSWER",
                content: answer,
              },
            ]);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }
  }, [messages]);

  const reload = () => {
    // 为 "reload" 提供逻辑，例如重新加载聊天
    setIsLoading(true);
    // 这里你可能想从服务器重新获取数据或执行其他相关操作
    setTimeout(() => {
      // 使用 setTimeout 仅作为示例
      setIsLoading(false);
    }, 1000);
  };

  const stop = () => {
    // 为 "stop" 提供逻辑，例如停止加载或取消当前正在执行的操作
    setIsLoading(false);
  };

  useEffect(() => {
    // 这里可以放置初始化的逻辑，例如当组件首次加载时从服务器获取数据
    // 示例：发送请求到服务器获取初始消息
    // fetch("/path/to/api").then(response => {
    //   if (response.status === 401) {
    //     onResponse && onResponse(response);
    //   } else {
    //     response.json().then(data => {
    //       setMessages(data.messages);
    //     });
    //   }
    // });
  }, []); // 空数组意味着 useEffect 仅在组件首次加载时运行

  return { messages, append, reload, stop, isLoading, input, setInput };
}
