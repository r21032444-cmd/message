(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();function d(u){return u==null?"":String(u).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function N(u,t=300){let e;return function(...i){const n=()=>{clearTimeout(e),u(...i)};clearTimeout(e),e=setTimeout(n,t)}}function S(u="id"){return`${u}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}function y(u=""){const t=u.trim().split(/\s+/);return t.length===0||!t[0]?"?":t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[1].charAt(0)).toUpperCase()}function w(u=""){const t=["linear-gradient(135deg, #1e3a8a, #3b82f6)","linear-gradient(135deg, #065f46, #10b981)","linear-gradient(135deg, #701a75, #ec4899)","linear-gradient(135deg, #831843, #f43f5e)","linear-gradient(135deg, #312e81, #6366f1)","linear-gradient(135deg, #78350f, #f59e0b)","linear-gradient(135deg, #134e4a, #14b8a6)","linear-gradient(135deg, #0f172a, #475569)"];let e=0;for(let i=0;i<u.length;i++)e=u.charCodeAt(i)+((e<<5)-e);const s=Math.abs(e)%t.length;return t[s]}class P{constructor(){this.ctx=null,this.enabled=!0}init(){if(!this.ctx&&(window.AudioContext||window.webkitAudioContext)){const t=window.AudioContext||window.webkitAudioContext;this.ctx=new t}this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}playSent(){if(this.enabled)try{if(this.init(),!this.ctx)return;const t=this.ctx.createOscillator(),e=this.ctx.createGain(),s=this.ctx.currentTime;t.type="sine",t.frequency.setValueAtTime(540,s),t.frequency.exponentialRampToValueAtTime(880,s+.08),e.gain.setValueAtTime(.12,s),e.gain.exponentialRampToValueAtTime(.001,s+.09),t.connect(e),e.connect(this.ctx.destination),t.start(s),t.stop(s+.09)}catch{}}playReceived(){if(this.enabled)try{if(this.init(),!this.ctx)return;const t=this.ctx.currentTime,e=this.ctx.createOscillator(),s=this.ctx.createOscillator(),i=this.ctx.createGain();e.type="sine",s.type="sine",e.frequency.setValueAtTime(587.33,t),s.frequency.setValueAtTime(880,t+.08),i.gain.setValueAtTime(.15,t),i.gain.exponentialRampToValueAtTime(.001,t+.25),e.connect(i),s.connect(i),i.connect(this.ctx.destination),e.start(t),e.stop(t+.08),s.start(t+.08),s.stop(t+.25)}catch{}}playCalling(){if(this.enabled)try{if(this.init(),!this.ctx)return;const t=this.ctx.currentTime,e=this.ctx.createOscillator(),s=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(425,t),s.gain.setValueAtTime(.1,t),s.gain.setValueAtTime(.1,t+.4),s.gain.exponentialRampToValueAtTime(.001,t+.5),e.connect(s),s.connect(this.ctx.destination),e.start(t),e.stop(t+.5)}catch{}}}const f=new P,T="clock_messenger_state_v2",I={id:"me",name:"Константин Орлов",username:"korlov_clock",phone:"+7 (912) 345-67-89",bio:"Разработчик интерфейсов и энтузиаст Clock Messenger 🚀",status:"в сети",avatar:null},B={theme:"dark",fontSize:"15px",soundEnabled:!0,showOnlineStatus:!0,autoDownloadMedia:!0,language:"ru"},M=[{id:"chat_1",name:"Елена Морозова",username:"elena_designer",phone:"+7 (903) 111-22-33",bio:"Product Designer @ Clock Team. Люблю минимализм и чистый код.",avatar:null,status:"online",isPinned:!0,isArchived:!1,unreadCount:2,typing:!1,mediaList:[{id:"m1",type:"image",url:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",date:"14 мая"},{id:"m2",type:"image",url:"https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80",date:"12 мая"},{id:"m3",type:"image",url:"https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80",date:"10 мая"}],filesList:[{id:"f1",name:"Design_System_Clock_v2.fig",size:"24.8 МБ",date:"14 мая"},{id:"f2",name:"UI_Components_Export.zip",size:"8.4 МБ",date:"11 мая"}],linksList:[{id:"l1",title:"Figma Community - Clock UI Kit",url:"https://figma.com/@clock_ui",domain:"figma.com"},{id:"l2",title:"GitHub Repository",url:"https://github.com/clock-messenger",domain:"github.com"}],messages:[{id:"msg_1_1",senderId:"chat_1",senderName:"Елена Морозова",text:"Привет, Константин! Посмотрела новую верстку чата. Выглядит потрясающе!",type:"text",timestamp:Date.now()-36e5*5,status:"read"},{id:"msg_1_2",senderId:"me",senderName:"Константин Орлов",text:"Спасибо! Добавил кастомные скроллбары и темную тему.",type:"text",timestamp:Date.now()-36e5*3,status:"read"},{id:"msg_1_3",senderId:"chat_1",senderName:"Елена Морозова",text:"Отлично! Отправляю превью обновленной цветовой палитры интерфейса:",type:"text",timestamp:Date.now()-36e5*2,status:"read"},{id:"msg_1_4",senderId:"chat_1",senderName:"Елена Морозова",text:"Концепт оформления экранов",type:"image",mediaUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",timestamp:Date.now()-36e5*2+1e3,status:"read"},{id:"msg_1_5",senderId:"chat_1",senderName:"Елена Морозова",text:"Голосовая заметка по анимациям переходов",type:"voice",duration:28,timestamp:Date.now()-1e3*60*12,status:"delivered"},{id:"msg_1_6",senderId:"chat_1",senderName:"Елена Морозова",text:"Проверь, пожалуйста, как отображаются статусы сообщений и автоскролл!",type:"text",timestamp:Date.now()-1e3*60*4,status:"sent"}]}];M.push({id:"chat_2",name:"Алексей Смирнов",username:"alex_smirnov_lead",phone:"+7 (916) 777-88-99",bio:"Frontend Architect. TypeScript, Performance, Canvas & WebGL.",avatar:null,status:"online",isPinned:!0,isArchived:!1,unreadCount:0,typing:!1,mediaList:[{id:"m4",type:"image",url:"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80",date:"Вчера"}],filesList:[{id:"f3",name:"Architecture_Plan.pdf",size:"1.2 МБ",date:"Вчера"}],linksList:[{id:"l3",title:"Web Audio API Docs (MDN)",url:"https://developer.mozilla.org",domain:"mozilla.org"}],messages:[{id:"msg_2_1",senderId:"chat_2",senderName:"Алексей Смирнов",text:"Доброе утро! Архитектуру ES Modules подготовили без единого внешнего бандлера.",type:"text",timestamp:Date.now()-36e5*24,status:"read"},{id:"msg_2_2",senderId:"me",senderName:"Константин Орлов",text:"Супер, всё нативно, чисто и максимально быстро грузится.",type:"text",timestamp:Date.now()-36e5*20,status:"read"},{id:"msg_2_3",senderId:"chat_2",senderName:"Алексей Смирнов",text:"Сделал проверку: debounce на поиск отрабатывает стабильно за 300 мс 👍",type:"text",timestamp:Date.now()-36e5*1,status:"read"}]},{id:"chat_3",name:"Дизайн Команда Clock 🎨",username:"clock_design_group",phone:"Группа (6 участников)",bio:"Официальный рабочий чат дизайнеров и UX исследователей Clock",avatar:null,status:"6 участников",isPinned:!1,isArchived:!1,unreadCount:5,typing:!1,mediaList:[],filesList:[],linksList:[],messages:[{id:"msg_3_1",senderId:"user_kate",senderName:"Екатерина В.",text:"Коллеги, обсудим новые иконки для контекстного меню?",type:"text",timestamp:Date.now()-36e5*48,status:"read"},{id:"msg_3_2",senderId:"user_igor",senderName:"Игорь Т.",text:"Давайте сделаем их лаконичными, с плавным скруглением.",type:"text",timestamp:Date.now()-36e5*2,status:"read"}]},{id:"chat_4",name:"Clock Support Bot 🤖",username:"clock_support_bot",phone:"Служба заботы Clock",bio:"Автоматический помощник и справочный центр мессенджера Clock.",avatar:null,status:"online",isPinned:!1,isArchived:!1,unreadCount:0,typing:!1,mediaList:[],filesList:[],linksList:[],messages:[{id:"msg_4_1",senderId:"chat_4",senderName:"Clock Support Bot",text:"Добро пожаловать в Clock Messenger! Вы можете отправлять сообщения, прикреплять файлы, записывать голосовые и настраивать интерфейс.",type:"text",timestamp:Date.now()-36e5*72,status:"read"}]},{id:"chat_5",name:"Анна Васильева",username:"anna_vasilyeva",phone:"+7 (925) 444-55-66",bio:"Product Manager. Кофе, продуктовые метрики и качественный UX.",avatar:null,status:Date.now()-1e3*60*45,isPinned:!1,isArchived:!1,unreadCount:0,typing:!1,mediaList:[],filesList:[],linksList:[],messages:[{id:"msg_5_1",senderId:"chat_5",senderName:"Анна Васильева",text:"Привет! Добавим опрос по новой фиче сегодня вечером?",type:"text",timestamp:Date.now()-36e5*15,status:"read"}]},{id:"chat_6",name:"Архив: Старые проекты",username:"archive_channel",phone:"Архивный чат",bio:"Сохраненные диалоги и старые переписки",avatar:null,status:"архив",isPinned:!1,isArchived:!0,unreadCount:0,typing:!1,mediaList:[],filesList:[],linksList:[],messages:[{id:"msg_6_1",senderId:"me",senderName:"Константин Орлов",text:"Архивированные данные перенесены.",type:"text",timestamp:Date.now()-36e5*200,status:"read"}]});class H{constructor(){this.listeners=new Map,this.user=structuredClone(I),this.settings=structuredClone(B),this.chats=structuredClone(M),this.activeChatId=null,this.currentScreen="chats",this.searchQuery="",this.activeFilter="all",this.replyTo=null,this.typingTimeouts=new Map,this.loadFromStorage()}loadFromStorage(){try{const t=localStorage.getItem(T);if(t){const e=JSON.parse(t);e.user&&(this.user={...this.user,...e.user}),e.settings&&(this.settings={...this.settings,...e.settings}),Array.isArray(e.chats)&&e.chats.length>0&&(this.chats=e.chats),e.activeChatId&&(this.activeChatId=e.activeChatId)}}catch(t){console.warn("Failed to load state from localStorage:",t)}}saveToStorage(){try{const t={user:this.user,settings:this.settings,chats:this.chats,activeChatId:this.activeChatId};localStorage.setItem(T,JSON.stringify(t))}catch(t){console.warn("Failed to save state to localStorage:",t)}}on(t,e){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(e),()=>this.off(t,e)}off(t,e){this.listeners.has(t)&&this.listeners.get(t).delete(e)}emit(t,e){this.listeners.has(t)&&this.listeners.get(t).forEach(s=>{try{s(e)}catch(i){console.error(`Error in listener for ${t}:`,i)}})}setScreen(t,e=null){this.currentScreen=t,e!==null&&(this.activeChatId=e,t==="chat"&&this.markChatAsRead(e)),this.emit("screenChanged",{screen:this.currentScreen,chatId:this.activeChatId}),this.emit("stateUpdated")}getActiveChat(){return this.activeChatId&&this.chats.find(t=>t.id===this.activeChatId)||null}getVisibleChats(){let t=this.chats.filter(e=>this.activeFilter==="archived"?e.isArchived:!e.isArchived);if(this.searchQuery.trim()){const e=this.searchQuery.toLowerCase().trim();t=t.filter(s=>{const i=s.name.toLowerCase().includes(e),n=(s.username||"").toLowerCase().includes(e),a=s.messages[s.messages.length-1],c=a&&a.text&&a.text.toLowerCase().includes(e);return i||n||c})}return t.sort((e,s)=>{if(e.isPinned!==s.isPinned)return e.isPinned?-1:1;const i=e.messages.length?e.messages[e.messages.length-1].timestamp:0;return(s.messages.length?s.messages[s.messages.length-1].timestamp:0)-i}),t}sendMessage({text:t,type:e="text",mediaUrl:s=null,duration:i=null,replyTo:n=null,simulateError:a=!1}){const c=this.getActiveChat();if(!c)return null;const r=S("msg"),l={id:r,senderId:this.user.id,senderName:this.user.name,text:t||"",type:e,mediaUrl:s,duration:i,replyTo:n?{id:n.id,senderName:n.senderName,text:n.text,type:n.type}:null,timestamp:Date.now(),status:a?"error":"sent"};return c.messages.push(l),this.replyTo=null,this.saveToStorage(),f.playSent(),this.emit("messageAdded",{chatId:c.id,message:l}),this.emit("chatUpdated",c),a||(setTimeout(()=>{const m=c.messages.find(h=>h.id===r);m&&m.status==="sent"&&(m.status="delivered",this.saveToStorage(),this.emit("messageStatusChanged",{chatId:c.id,messageId:r,status:"delivered"}))},800),setTimeout(()=>{const m=c.messages.find(h=>h.id===r);m&&m.status==="delivered"&&(m.status="read",this.saveToStorage(),this.emit("messageStatusChanged",{chatId:c.id,messageId:r,status:"read"}))},2e3),this.triggerSimulatedReply(c.id,t)),l}retryMessage(t){const e=this.getActiveChat();if(!e)return;const s=e.messages.find(i=>i.id===t);s&&(s.status="sent",s.timestamp=Date.now(),this.saveToStorage(),f.playSent(),this.emit("messageStatusChanged",{chatId:e.id,messageId:t,status:"sent"}),setTimeout(()=>{s.status="delivered",this.saveToStorage(),this.emit("messageStatusChanged",{chatId:e.id,messageId:t,status:"delivered"})},800),setTimeout(()=>{s.status="read",this.saveToStorage(),this.emit("messageStatusChanged",{chatId:e.id,messageId:t,status:"read"})},2e3))}triggerSimulatedReply(t,e=""){const s=this.chats.find(a=>a.id===t);if(!s||s.id==="chat_6")return;this.typingTimeouts.has(t)&&clearTimeout(this.typingTimeouts.get(t));const i=1200+Math.random()*800,n=setTimeout(()=>{s.typing=!0,this.emit("typingChanged",{chatId:s.id,typing:!0});const a=2e3+Math.random()*1500;setTimeout(()=>{s.typing=!1,this.emit("typingChanged",{chatId:s.id,typing:!1});const c=["Отличная мысль, полностью согласен!","Принято в работу, скоро пришлю апдейт ⚡","Понял тебя. Потестирую этот сценарий прямо сейчас.","Выглядит супер! Clock работает плавно и быстро.","Спасибо за сообщение! Отличный прототип получился.","Договорились, сейчас оформлю детали в таску."],r=c[Math.floor(Math.random()*c.length)],l={id:S("msg"),senderId:s.id,senderName:s.name,text:r,type:"text",timestamp:Date.now(),status:"read"};s.messages.push(l),this.activeChatId!==s.id&&(s.unreadCount=(s.unreadCount||0)+1),this.saveToStorage(),f.playReceived(),this.emit("messageAdded",{chatId:s.id,message:l}),this.emit("chatUpdated",s)},a)},i);this.typingTimeouts.set(t,n)}deleteMessage(t){const e=this.getActiveChat();if(!e)return;const s=e.messages.findIndex(i=>i.id===t);s!==-1&&(e.messages.splice(s,1),this.saveToStorage(),this.emit("messageDeleted",{chatId:e.id,messageId:t}),this.emit("chatUpdated",e))}forwardMessage(t,e){const s=this.getActiveChat();if(!s)return;const i=s.messages.find(c=>c.id===t),n=this.chats.find(c=>c.id===e);if(!i||!n)return;const a={id:S("msg"),senderId:this.user.id,senderName:this.user.name,text:i.text,type:i.type,mediaUrl:i.mediaUrl,duration:i.duration,forwardedFrom:i.senderName,timestamp:Date.now(),status:"sent"};n.messages.push(a),this.saveToStorage(),f.playSent(),this.emit("chatUpdated",n),this.activeChatId===e&&this.emit("messageAdded",{chatId:n.id,message:a})}togglePinChat(t){const e=this.chats.find(s=>s.id===t);e&&(e.isPinned=!e.isPinned,this.saveToStorage(),this.emit("chatUpdated",e),this.emit("stateUpdated"))}toggleArchiveChat(t){const e=this.chats.find(s=>s.id===t);e&&(e.isArchived=!e.isArchived,this.saveToStorage(),this.emit("chatUpdated",e),this.emit("stateUpdated"))}markChatAsRead(t){const e=this.chats.find(s=>s.id===t);e&&e.unreadCount>0&&(e.unreadCount=0,this.saveToStorage(),this.emit("chatUpdated",e))}markChatAsUnread(t){const e=this.chats.find(s=>s.id===t);e&&(e.unreadCount=(e.unreadCount||0)+1,this.saveToStorage(),this.emit("chatUpdated",e))}deleteChat(t){const e=this.chats.findIndex(s=>s.id===t);e!==-1&&(this.chats.splice(e,1),this.activeChatId===t&&(this.activeChatId=null,this.currentScreen="chats"),this.saveToStorage(),this.emit("chatDeleted",t),this.emit("stateUpdated"))}createNewChat({name:t,username:e,bio:s,isGroup:i=!1}){const n={id:S("chat"),name:t.trim(),username:e?e.replace(/^@/,"").trim():`user_${Date.now().toString().slice(-4)}`,phone:i?"Группа (1 участник)":"+7 (900) 000-00-00",bio:s||(i?"Новая группа в Clock":"Пользователь Clock Messenger"),avatar:null,status:"online",isPinned:!1,isArchived:!1,unreadCount:0,typing:!1,mediaList:[],filesList:[],linksList:[],messages:[{id:S("msg"),senderId:"me",senderName:this.user.name,text:i?`Группа "${t}" создана`:"Чат начат. Привет!",type:"text",timestamp:Date.now(),status:"read"}]};return this.chats.unshift(n),this.saveToStorage(),this.emit("stateUpdated"),this.setScreen("chat",n.id),n}updateUserProfile({name:t,username:e,bio:s,phone:i,avatar:n}){t!==void 0&&(this.user.name=t),e!==void 0&&(this.user.username=e),s!==void 0&&(this.user.bio=s),i!==void 0&&(this.user.phone=i),n!==void 0&&(this.user.avatar=n),this.saveToStorage(),this.emit("userUpdated",this.user)}updateSettings(t){this.settings={...this.settings,...t},f.enabled=this.settings.soundEnabled,this.saveToStorage(),this.applySettingsToDOM(),this.emit("settingsUpdated",this.settings)}applySettingsToDOM(){const t=document.documentElement;this.settings.theme==="dark"?t.setAttribute("data-theme","dark"):t.removeAttribute("data-theme"),t.style.setProperty("--base-font-size",this.settings.fontSize)}resetAllData(){localStorage.removeItem(T),this.user=structuredClone(I),this.settings=structuredClone(B),this.chats=structuredClone(M),this.activeChatId=null,this.currentScreen="chats",this.searchQuery="",this.activeFilter="all",this.replyTo=null,this.applySettingsToDOM(),this.emit("stateUpdated"),this.emit("screenChanged",{screen:"chats",chatId:null})}}const o=new H;function E(u){return u?new Date(u).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!1}):""}function D(u){if(!u)return"";const t=new Date(u),e=new Date;if(t.getDate()===e.getDate()&&t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear())return"Сегодня";const i=new Date(e);if(i.setDate(e.getDate()-1),t.getDate()===i.getDate()&&t.getMonth()===i.getMonth()&&t.getFullYear()===i.getFullYear())return"Вчера";const a=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],c=t.getDate(),r=a[t.getMonth()],l=t.getFullYear();return l===e.getFullYear()?`${c} ${r}`:`${c} ${r} ${l}`}function U(u){if(!u)return"";const t=new Date(u),e=new Date;if(t.getDate()===e.getDate()&&t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear())return E(u);const i=new Date(e);if(i.setDate(e.getDate()-1),t.getDate()===i.getDate()&&t.getMonth()===i.getMonth()&&t.getFullYear()===i.getFullYear())return"Вчера";const a=["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];if(Math.floor((e-t)/(1e3*60*60*24))<7)return a[t.getDay()];const r=["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];return`${t.getDate()} ${r[t.getMonth()]}`}function $(u){if(!u)return"был(а) недавно";if(u==="online")return"в сети";if(typeof u=="number"){const t=Date.now()-u;return t<6e4?"был(а) только что":t<36e5?`был(а) ${Math.floor(t/6e4)} мин. назад`:`был(а) в ${E(u)}`}return u}class V{constructor(){this.container=null,this.activeCallInterval=null}init(t){this.container=t}showToast(t,e=2500){const s=document.createElement("div");s.className="clock-toast",s.innerHTML=`<span class="toast-text">${d(t)}</span>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("visible")),setTimeout(()=>{s.classList.remove("visible"),setTimeout(()=>s.remove(),300)},e)}showNewChatModal(){const t=document.createElement("div");t.className="modal-backdrop",t.innerHTML=`
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Новый диалог</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <form id="new-chat-form" class="modal-body">
          <div class="form-group">
            <label>Имя контакта или группы</label>
            <input type="text" id="new-chat-name" class="form-input" placeholder="Например: Иван Петров" required autofocus />
          </div>
          <div class="form-group">
            <label>Юзернейм (необязательно)</label>
            <div class="input-with-prefix">
              <span class="prefix">@</span>
              <input type="text" id="new-chat-username" class="form-input" placeholder="ivan_dev" />
            </div>
          </div>
          <div class="form-group">
            <label>О себе / Описание</label>
            <input type="text" id="new-chat-bio" class="form-input" placeholder="Статус или описание" />
          </div>
          <div class="form-group checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" id="new-chat-isgroup" />
              <span class="checkmark"></span>
              Создать как групповой чат
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="submit" class="btn btn-primary">Создать чат</button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("visible"));const e=()=>{t.classList.remove("visible"),setTimeout(()=>t.remove(),250)};t.querySelector(".close-btn").addEventListener("click",e),t.querySelector(".cancel-btn").addEventListener("click",e),t.addEventListener("click",i=>{i.target===t&&e()}),t.querySelector("#new-chat-form").addEventListener("submit",i=>{i.preventDefault();const n=t.querySelector("#new-chat-name").value.trim(),a=t.querySelector("#new-chat-username").value.trim(),c=t.querySelector("#new-chat-bio").value.trim(),r=t.querySelector("#new-chat-isgroup").checked;n&&(o.createNewChat({name:n,username:a,bio:c,isGroup:r}),this.showToast(r?`Группа "${n}" создана`:`Чат с ${n} создан`),e())})}showForwardModal(t){const e=document.createElement("div");e.className="modal-backdrop";const s=o.chats.map(n=>{const a=y(n.name),c=w(n.name);return`
          <div class="forward-chat-item" data-chat-id="${d(n.id)}">
            <div class="avatar avatar-sm" style="background: ${c};">${a}</div>
            <div class="forward-chat-info">
              <span class="forward-chat-name">${d(n.name)}</span>
              <span class="forward-chat-sub">${n.isGroup?"Группа":"@"+d(n.username)}</span>
            </div>
            <button class="btn btn-sm btn-primary forward-action-btn">Отправить</button>
          </div>
        `}).join("");e.innerHTML=`
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Переслать сообщение</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body modal-scrollable">
          <div class="forward-chats-container">
            ${s}
          </div>
        </div>
      </div>
    `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("visible"));const i=()=>{e.classList.remove("visible"),setTimeout(()=>e.remove(),250)};e.querySelector(".close-btn").addEventListener("click",i),e.addEventListener("click",n=>{n.target===e&&i()}),e.querySelectorAll(".forward-chat-item").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.chatId;o.forwardMessage(t,a),this.showToast("Сообщение переслано"),i()})})}showDeleteMessageConfirm(t){const e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-header">
          <h3>Удалить сообщение?</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Вы действительно хотите удалить это сообщение? Это действие нельзя отменить.</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="button" class="btn btn-danger confirm-btn">Удалить</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("visible"));const s=()=>{e.classList.remove("visible"),setTimeout(()=>e.remove(),250)};e.querySelector(".close-btn").addEventListener("click",s),e.querySelector(".cancel-btn").addEventListener("click",s),e.addEventListener("click",i=>{i.target===e&&s()}),e.querySelector(".confirm-btn").addEventListener("click",()=>{o.deleteMessage(t),this.showToast("Сообщение удалено"),s()})}showDeleteChatConfirm(t){const e=o.chats.find(a=>a.id===t),s=e?e.name:"этот чат",i=document.createElement("div");i.className="modal-backdrop",i.innerHTML=`
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-header">
          <h3>Удалить чат?</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Вы уверены, что хотите удалить историю чата «${d(s)}»?</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="button" class="btn btn-danger confirm-btn">Удалить чат</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("visible"));const n=()=>{i.classList.remove("visible"),setTimeout(()=>i.remove(),250)};i.querySelector(".close-btn").addEventListener("click",n),i.querySelector(".cancel-btn").addEventListener("click",n),i.addEventListener("click",a=>{a.target===i&&n()}),i.querySelector(".confirm-btn").addEventListener("click",()=>{o.deleteChat(t),this.showToast("Чат удален"),n()})}showAttachMenu(t,e){const s=document.querySelector(".attach-popup-menu");if(s){s.remove();return}const i=t.getBoundingClientRect(),n=document.createElement("div");n.className="attach-popup-menu",n.style.bottom=`${window.innerHeight-i.top+8}px`,n.style.left=`${Math.max(16,i.left-40)}px`,n.innerHTML=`
      <button class="attach-item" data-type="photo">
        <span class="attach-icon">📷</span>
        <span class="attach-label">Фото или видео</span>
      </button>
      <button class="attach-item" data-type="file">
        <span class="attach-icon">📄</span>
        <span class="attach-label">Документ / Файл</span>
      </button>
      <button class="attach-item" data-type="voice">
        <span class="attach-icon">🎙</span>
        <span class="attach-label">Голосовое сообщение</span>
      </button>
      <button class="attach-item" data-type="poll">
        <span class="attach-icon">📊</span>
        <span class="attach-label">Опрос</span>
      </button>
      <button class="attach-item" data-type="error-test">
        <span class="attach-icon">⚠️</span>
        <span class="attach-label">Тест ошибки отправки</span>
      </button>
    `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("visible"));const a=c=>{!n.contains(c.target)&&c.target!==t&&(n.classList.remove("visible"),setTimeout(()=>n.remove(),200),document.removeEventListener("click",a))};setTimeout(()=>document.addEventListener("click",a),10),n.querySelectorAll(".attach-item").forEach(c=>{c.addEventListener("click",()=>{const r=c.dataset.type;n.remove(),document.removeEventListener("click",a),e(r)})})}showCallModal(t="audio",e){this.activeCallInterval&&clearInterval(this.activeCallInterval),f.playCalling();const s=e?e.name:"Собеседник",i=y(s),n=w(s),a=document.createElement("div");a.className="modal-backdrop call-modal-backdrop",a.innerHTML=`
      <div class="call-dialog">
        <div class="call-header">
          <span class="call-type-badge">${t==="video"?"📹 Видеозвонок Clock":"📞 Аудиозвонок Clock"}</span>
          <span class="call-status" id="call-timer-status">Вызов...</span>
        </div>
        <div class="call-avatar-wrapper">
          <div class="call-avatar-pulse pulse-1"></div>
          <div class="call-avatar-pulse pulse-2"></div>
          <div class="call-avatar" style="background: ${n};">${i}</div>
        </div>
        <h2 class="call-user-name">${d(s)}</h2>
        <p class="call-sub-status">Соединение защищено сквозным шифрованием</p>

        <div class="call-actions">
          <button class="call-action-btn mute-btn" id="call-btn-mute" title="Микрофон">
            <span>🎤</span>
          </button>
          ${t==="video"?`
            <button class="call-action-btn video-btn active" id="call-btn-video" title="Камера">
              <span>📹</span>
            </button>
          `:""}
          <button class="call-action-btn hangup-btn" id="call-btn-hangup" title="Завершить">
            <span>📞</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("visible"));let c=0;const r=a.querySelector("#call-timer-status"),l=setTimeout(()=>{r.textContent="00:00",this.activeCallInterval=setInterval(()=>{c++;const v=String(Math.floor(c/60)).padStart(2,"0"),b=String(c%60).padStart(2,"0");r.textContent=`${v}:${b}`},1e3)},2e3),m=()=>{clearTimeout(l),this.activeCallInterval&&(clearInterval(this.activeCallInterval),this.activeCallInterval=null),a.classList.remove("visible"),setTimeout(()=>a.remove(),250),this.showToast("Звонок завершен")};a.querySelector("#call-btn-hangup").addEventListener("click",m);const h=a.querySelector("#call-btn-mute");h.addEventListener("click",()=>{h.classList.toggle("disabled"),this.showToast(h.classList.contains("disabled")?"Микрофон отключен":"Микрофон включен")})}showImageZoom(t,e=""){const s=document.createElement("div");s.className="modal-backdrop image-zoom-backdrop",s.innerHTML=`
      <div class="image-zoom-container">
        <button class="icon-btn image-zoom-close" title="Закрыть">✕</button>
        <img src="${d(t)}" alt="Zoomed preview" class="zoomed-image" />
        ${e?`<div class="image-zoom-caption">${d(e)}</div>`:""}
      </div>
    `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("visible"));const i=()=>{s.classList.remove("visible"),setTimeout(()=>s.remove(),250)};s.querySelector(".image-zoom-close").addEventListener("click",i),s.addEventListener("click",n=>{n.target===s&&i()})}showEditProfileModal(){const t=o.user,e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Редактировать профиль</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <form id="edit-profile-form" class="modal-body">
          <div class="form-group">
            <label>Ваше имя</label>
            <input type="text" id="edit-profile-name" class="form-input" value="${d(t.name)}" required />
          </div>
          <div class="form-group">
            <label>Имя пользователя (username)</label>
            <div class="input-with-prefix">
              <span class="prefix">@</span>
              <input type="text" id="edit-profile-username" class="form-input" value="${d(t.username)}" required />
            </div>
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input type="text" id="edit-profile-phone" class="form-input" value="${d(t.phone||"")}" />
          </div>
          <div class="form-group">
            <label>О себе (Bio)</label>
            <textarea id="edit-profile-bio" class="form-textarea" rows="3">${d(t.bio||"")}</textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("visible"));const s=()=>{e.classList.remove("visible"),setTimeout(()=>e.remove(),250)};e.querySelector(".close-btn").addEventListener("click",s),e.querySelector(".cancel-btn").addEventListener("click",s),e.addEventListener("click",n=>{n.target===e&&s()}),e.querySelector("#edit-profile-form").addEventListener("submit",n=>{n.preventDefault();const a=e.querySelector("#edit-profile-name").value.trim(),c=e.querySelector("#edit-profile-username").value.trim(),r=e.querySelector("#edit-profile-phone").value.trim(),l=e.querySelector("#edit-profile-bio").value.trim();a&&(o.updateUserProfile({name:a,username:c,phone:r,bio:l}),p.showToast("Профиль успешно обновлен"),s())})}}const p=new V;class F{constructor(t){this.container=t,this.activeContextMenu=null,this.init()}init(){this.render(),this.bindEvents(),o.on("chatUpdated",()=>this.renderListOnly()),o.on("chatDeleted",()=>this.renderListOnly()),o.on("stateUpdated",()=>this.renderListOnly()),o.on("typingChanged",()=>this.renderListOnly())}render(){this.container.innerHTML=`
      <div class="chat-list-panel">
        <header class="chat-list-header">
          <div class="header-top-row">
            <div class="brand-wrapper">
              <button class="icon-btn menu-toggle-btn" id="btn-open-settings" title="Настройки">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <div class="brand-title">
                <svg class="brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Clock</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="icon-btn desktop-only" id="btn-desktop-new-chat" title="Новый чат">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="search-bar-wrapper">
            <div class="search-input-box">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="chat-search-input" class="search-input" placeholder="Поиск по чатам и сообщениям..." value="${d(o.searchQuery)}" />
              <button class="search-clear-btn ${o.searchQuery?"visible":""}" id="btn-clear-search" title="Очистить">✕</button>
            </div>
          </div>

          <div class="chat-filter-tabs">
            <button class="filter-tab ${o.activeFilter==="all"?"active":""}" data-filter="all">Все чаты</button>
            <button class="filter-tab ${o.activeFilter==="archived"?"active":""}" data-filter="archived">
              Архив ${o.chats.filter(t=>t.isArchived).length>0?`(${o.chats.filter(t=>t.isArchived).length})`:""}
            </button>
          </div>
        </header>

        <div class="chat-items-container custom-scrollbar" id="chat-items-list">
          <!-- Rendered items -->
        </div>

        <button class="fab-new-chat mobile-only" id="btn-mobile-new-chat" title="Новый чат">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `,this.renderListOnly()}renderListOnly(){const t=this.container.querySelector("#chat-items-list");if(!t)return;const e=o.getVisibleChats();if(e.length===0){t.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h4>Чаты не найдены</h4>
          <p>${o.searchQuery?"Попробуйте изменить поисковый запрос":"Создайте новый чат, нажав кнопку ниже"}</p>
        </div>
      `;return}const s=e.filter(a=>a.isPinned),i=e.filter(a=>!a.isPinned);let n="";s.length>0&&(n+='<div class="chat-section-label"><span>Закрепленные сообщения</span></div>',n+=s.map(a=>this.renderChatItemHTML(a)).join(""),i.length>0&&(n+='<div class="pinned-divider"></div>',n+='<div class="chat-section-label"><span>Все сообщения</span></div>')),n+=i.map(a=>this.renderChatItemHTML(a)).join(""),t.innerHTML=n,this.bindItemEvents(t)}renderChatItemHTML(t){const e=t.messages[t.messages.length-1],s=o.activeChatId===t.id,i=y(t.name),n=w(t.name),a=e?U(e.timestamp):"",c=t.status==="online";let r="",l="";if(t.typing)r='<span class="typing-text-preview"><span class="dots-pulse">...</span> печатает...</span>';else if(e){const m=e.senderId===o.user.id,h=m?'<span class="msg-prefix">Вы: </span>':"";m&&(e.status==="read"?l='<span class="status-ticks status-read" title="Прочитано">✓✓</span>':e.status==="delivered"?l='<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>':e.status==="error"?l='<span class="status-ticks status-error" title="Ошибка">!</span>':l='<span class="status-ticks status-sent" title="Отправлено">✓</span>'),e.type==="voice"?r=`${h}<span class="preview-media-icon">🎙</span> Голосовое сообщение`:e.type==="image"?r=`${h}<span class="preview-media-icon">📷</span> Фотография`:r=`${h}${d(e.text||"")}`}else r='<span class="empty-preview">Нет сообщений</span>';return`
      <div class="chat-item ${s?"active":""} ${t.isPinned?"is-pinned":""}" data-chat-id="${d(t.id)}">
        <div class="chat-avatar-wrapper">
          <div class="avatar avatar-md" style="background: ${n};">
            ${i}
          </div>
          ${c?'<span class="online-badge"></span>':""}
        </div>

        <div class="chat-main-info">
          <div class="chat-top-line">
            <h4 class="chat-name">${d(t.name)}</h4>
            <div class="chat-meta">
              ${l}
              <span class="chat-time">${a}</span>
            </div>
          </div>

          <div class="chat-bottom-line">
            <div class="chat-preview-text">${r}</div>
            <div class="chat-badges">
              ${t.isPinned?'<span class="pin-icon" title="Закреплено">📌</span>':""}
              ${t.unreadCount>0?`<span class="unread-badge">${t.unreadCount}</span>`:""}
            </div>
          </div>
        </div>

        <button class="chat-more-btn" data-chat-id="${d(t.id)}" title="Опции чата">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="12" cy="19" r="2"></circle>
          </svg>
        </button>
      </div>
    `}bindEvents(){const t=this.container.querySelector("#chat-search-input"),e=this.container.querySelector("#btn-clear-search"),s=N(l=>{o.searchQuery=l,e&&e.classList.toggle("visible",!!l),this.renderListOnly()},300);t.addEventListener("input",l=>{s(l.target.value)}),e&&e.addEventListener("click",()=>{t.value="",o.searchQuery="",e.classList.remove("visible"),this.renderListOnly(),t.focus()});const i=this.container.querySelectorAll(".filter-tab");i.forEach(l=>{l.addEventListener("click",()=>{i.forEach(m=>m.classList.remove("active")),l.classList.add("active"),o.activeFilter=l.dataset.filter,this.renderListOnly()})});const n=()=>p.showNewChatModal(),a=this.container.querySelector("#btn-desktop-new-chat"),c=this.container.querySelector("#btn-mobile-new-chat");a&&a.addEventListener("click",n),c&&c.addEventListener("click",n);const r=this.container.querySelector("#btn-open-settings");r&&r.addEventListener("click",()=>{o.setScreen("settings")}),document.addEventListener("click",l=>{this.activeContextMenu&&!this.activeContextMenu.contains(l.target)&&(this.activeContextMenu.remove(),this.activeContextMenu=null)})}bindItemEvents(t){t.querySelectorAll(".chat-item").forEach(e=>{const s=e.dataset.chatId;e.addEventListener("click",n=>{n.target.closest(".chat-more-btn")||o.setScreen("chat",s)}),e.addEventListener("contextmenu",n=>{n.preventDefault(),this.openContextMenu(n.clientX,n.clientY,s)});const i=e.querySelector(".chat-more-btn");i&&i.addEventListener("click",n=>{n.stopPropagation();const a=i.getBoundingClientRect();this.openContextMenu(a.left-120,a.bottom+4,s)})})}openContextMenu(t,e,s){this.activeContextMenu&&(this.activeContextMenu.remove(),this.activeContextMenu=null);const i=o.chats.find(a=>a.id===s);if(!i)return;const n=document.createElement("div");n.className="context-menu",n.style.left=`${Math.min(t,window.innerWidth-200)}px`,n.style.top=`${Math.min(e,window.innerHeight-180)}px`,n.innerHTML=`
      <button class="context-item" data-action="pin">
        <span class="context-icon">${i.isPinned?"📌":"📍"}</span>
        <span>${i.isPinned?"Открепить":"Закрепить"}</span>
      </button>
      <button class="context-item" data-action="archive">
        <span class="context-icon">${i.isArchived?"📥":"📦"}</span>
        <span>${i.isArchived?"Разархивировать":"Архивировать"}</span>
      </button>
      <button class="context-item" data-action="read">
        <span class="context-icon">✓</span>
        <span>${i.unreadCount>0?"Отметить как прочитанное":"Отметить как непрочитанное"}</span>
      </button>
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить чат</span>
      </button>
    `,document.body.appendChild(n),this.activeContextMenu=n,n.querySelectorAll(".context-item").forEach(a=>{a.addEventListener("click",()=>{const c=a.dataset.action;n.remove(),this.activeContextMenu=null,c==="pin"?(o.togglePinChat(s),p.showToast(i.isPinned?"Чат закреплен":"Чат откреплен")):c==="archive"?(o.toggleArchiveChat(s),p.showToast(i.isArchived?"Чат архивирован":"Чат возвращен из архива")):c==="read"?i.unreadCount>0?o.markChatAsRead(s):o.markChatAsUnread(s):c==="delete"&&p.showDeleteChatConfirm(s)})})}}class z{constructor(t){this.container=t,this.isUserScrolledUp=!1,this.activeVoiceAudios=new Map,this.activeContextMenu=null,this.init()}init(){this.render(),this.bindEvents(),o.on("messageAdded",t=>{o.activeChatId===t.chatId&&(this.appendSingleMessage(t.message),this.isUserScrolledUp?this.updateScrollBottomButton():this.scrollToBottom())}),o.on("messageStatusChanged",t=>{o.activeChatId===t.chatId&&this.updateMessageStatusInDOM(t.messageId,t.status)}),o.on("messageDeleted",t=>{if(o.activeChatId===t.chatId){const e=this.container.querySelector(`[data-message-id="${t.messageId}"]`);e&&e.remove()}}),o.on("typingChanged",t=>{o.activeChatId===t.chatId&&this.updateTypingIndicator(t.typing)}),o.on("screenChanged",({screen:t})=>{t==="chat"&&(this.render(),this.scrollToBottom(!1))})}render(){const t=o.getActiveChat();if(!t){this.container.innerHTML=`
        <div class="chat-placeholder-view">
          <div class="placeholder-content">
            <div class="clock-big-logo">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2>Выберите чат для начала общения</h2>
            <p>Clock — быстрый и стильный мессенджер с защитой данных и поддержкой мультимедиа</p>
          </div>
        </div>
      `;return}const e=y(t.name),s=w(t.name),i=t.typing?"печатает...":$(t.status);this.container.innerHTML=`
      <div class="chat-view-panel">
        <header class="chat-view-header">
          <div class="header-left">
            <button class="icon-btn back-to-chats-btn mobile-only" id="btn-back-chats" title="Назад">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div class="chat-header-profile-btn" id="btn-open-profile" title="Открыть профиль">
              <div class="avatar-wrapper">
                <div class="avatar avatar-sm" style="background: ${s};">${e}</div>
                ${t.status==="online"?'<span class="online-badge"></span>':""}
              </div>
              <div class="header-user-info">
                <h3 class="header-user-name">${d(t.name)}</h3>
                <span class="header-user-status ${t.typing?"is-typing":""}" id="header-status-text">
                  ${d(i)}
                </span>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="icon-btn" id="btn-call-audio" title="Позвонить">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
            <button class="icon-btn" id="btn-call-video" title="Видеозвонок">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button class="icon-btn" id="btn-chat-options" title="Параметры">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
          </div>
        </header>

        <div class="chat-messages-container custom-scrollbar" id="messages-scroll-area">
          <div class="messages-list-inner" id="messages-list">
            ${this.renderMessagesGroupedByDay(t.messages)}
          </div>
          <div class="typing-bubble-container ${t.typing?"visible":""}" id="typing-indicator-bubble">
            <div class="typing-bubble">
              <span></span><span></span><span></span>
            </div>
            <span class="typing-name">${d(t.name.split(" ")[0])} печатает...</span>
          </div>
        </div>

        <button class="scroll-bottom-btn" id="btn-scroll-bottom" title="Вниз">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div class="reply-preview-bar" id="reply-preview-bar" style="display: none;">
          <div class="reply-line"></div>
          <div class="reply-info">
            <span class="reply-author" id="reply-author-name"></span>
            <span class="reply-snippet" id="reply-snippet-text"></span>
          </div>
          <button class="icon-btn reply-cancel-btn" id="btn-cancel-reply" title="Отменить ответ">✕</button>
        </div>

        <div class="chat-input-area">
          <button class="icon-btn attach-btn" id="btn-attach" title="Прикрепить файл">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>

          <div class="input-text-wrapper">
            <textarea id="message-textarea" class="message-input" placeholder="Напишите сообщение..." rows="1"></textarea>
          </div>

          <button class="icon-btn voice-record-btn" id="btn-voice-record" title="Записать голосовое">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <button class="icon-btn send-message-btn" id="btn-send-message" title="Отправить">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `,this.bindMessageInteractions()}renderMessagesGroupedByDay(t){if(!t||t.length===0)return'<div class="empty-chat-hint">Здесь пока нет сообщений. Напишите первым!</div>';let e="",s=null;return t.forEach(i=>{const n=D(i.timestamp);n!==s&&(e+=`<div class="day-divider"><span>${d(n)}</span></div>`,s=n),e+=this.renderMessageItemHTML(i)}),e}renderMessageItemHTML(t){const e=t.senderId===o.user.id,s=E(t.timestamp);let i="";e&&(t.status==="read"?i='<span class="status-ticks status-read" title="Прочитано">✓✓</span>':t.status==="delivered"?i='<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>':t.status==="error"?i=`
          <span class="status-error-badge" title="Ошибка отправки">
            <span class="error-mark">!</span>
            <button class="retry-send-btn" data-retry-id="${d(t.id)}">Повторить</button>
          </span>
        `:i='<span class="status-ticks status-sent" title="Отправлено">✓</span>');let n="";t.replyTo&&(n=`
        <div class="message-reply-quote" data-quote-id="${d(t.replyTo.id||"")}">
          <div class="quote-bar"></div>
          <div class="quote-body">
            <span class="quote-sender">${d(t.replyTo.senderName||"Пользователь")}</span>
            <span class="quote-text">${d(t.replyTo.text||"Вложение")}</span>
          </div>
        </div>
      `);let a="";t.forwardedFrom&&(a=`
        <div class="message-forward-label">
          <span>Переслано от <b>${d(t.forwardedFrom)}</b></span>
        </div>
      `);let c="";if(t.type==="image")c=`
        <div class="message-image-wrapper">
          <img src="${d(t.mediaUrl||"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80")}" alt="Изображение" class="message-preview-img" />
        </div>
        ${t.text?`<p class="message-text-caption">${d(t.text)}</p>`:""}
      `;else if(t.type==="voice"){const r=t.duration||24,l=Math.floor(r/60),m=String(r%60).padStart(2,"0");c=`
        <div class="voice-message-player" data-duration="${r}">
          <button class="voice-play-btn" title="Воспроизвести">
            <svg class="play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="pause-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <div class="voice-waveform-container">
            <div class="voice-wave-bars">
              <span style="height: 35%"></span><span style="height: 60%"></span><span style="height: 90%"></span>
              <span style="height: 45%"></span><span style="height: 75%"></span><span style="height: 100%"></span>
              <span style="height: 55%"></span><span style="height: 80%"></span><span style="height: 40%"></span>
              <span style="height: 70%"></span><span style="height: 95%"></span><span style="height: 50%"></span>
              <span style="height: 85%"></span><span style="height: 30%"></span><span style="height: 65%"></span>
              <span style="height: 90%"></span><span style="height: 40%"></span><span style="height: 60%"></span>
            </div>
            <div class="voice-progress-fill"></div>
          </div>
          <span class="voice-duration">${l}:${m}</span>
        </div>
        ${t.text?`<p class="message-voice-caption">${d(t.text)}</p>`:""}
      `}else c=`<p class="message-text-content">${d(t.text)}</p>`;return`
      <div class="message-row ${e?"message-outgoing":"message-incoming"}" data-message-id="${d(t.id)}">
        <div class="message-bubble ${t.type==="image"?"bubble-image":""} ${t.status==="error"?"bubble-error":""}">
          ${a}
          ${n}
          ${c}
          <div class="message-meta-row">
            <span class="message-time">${s}</span>
            ${i}
          </div>
        </div>
      </div>
    `}appendSingleMessage(t){const e=this.container.querySelector("#messages-list");if(!e)return;const s=e.querySelector(".empty-chat-hint");s&&s.remove();const i=D(t.timestamp),n=e.querySelector(".day-divider:last-of-type");if(!n||n.textContent.trim()!==i){const r=document.createElement("div");r.className="day-divider",r.innerHTML=`<span>${d(i)}</span>`,e.appendChild(r)}const a=document.createElement("div");a.innerHTML=this.renderMessageItemHTML(t);const c=a.firstElementChild;e.appendChild(c),this.bindSingleMessageEvents(c)}updateMessageStatusInDOM(t,e){const s=this.container.querySelector(`[data-message-id="${t}"]`);if(!s)return;const i=s.querySelector(".message-meta-row"),n=s.querySelector(".message-bubble");if(!i)return;const a=i.querySelector(".status-ticks, .status-error-badge");a&&a.remove(),n&&n.classList.remove("bubble-error"),e==="read"?i.insertAdjacentHTML("beforeend",'<span class="status-ticks status-read" title="Прочитано">✓✓</span>'):e==="delivered"?i.insertAdjacentHTML("beforeend",'<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>'):e==="sent"&&i.insertAdjacentHTML("beforeend",'<span class="status-ticks status-sent" title="Отправлено">✓</span>')}updateTypingIndicator(t){const e=this.container.querySelector("#typing-indicator-bubble"),s=this.container.querySelector("#header-status-text"),i=o.getActiveChat();e&&e.classList.toggle("visible",t),s&&i&&(t?(s.textContent="печатает...",s.classList.add("is-typing")):(s.textContent=$(i.status),s.classList.remove("is-typing"))),t&&!this.isUserScrolledUp&&this.scrollToBottom()}scrollToBottom(t=!0){const e=this.container.querySelector("#messages-scroll-area");e&&(e.scrollTo({top:e.scrollHeight,behavior:t?"smooth":"auto"}),this.isUserScrolledUp=!1,this.updateScrollBottomButton())}updateScrollBottomButton(){const t=this.container.querySelector("#btn-scroll-bottom");t&&t.classList.toggle("visible",this.isUserScrolledUp)}bindEvents(){const t=o.getActiveChat();if(!t)return;const e=this.container.querySelector("#btn-back-chats");e&&e.addEventListener("click",()=>{o.setScreen("chats")});const s=this.container.querySelector("#btn-open-profile");s&&s.addEventListener("click",()=>{o.setScreen("profile")});const i=this.container.querySelector("#btn-call-audio");i&&i.addEventListener("click",()=>{p.showCallModal("audio",t)});const n=this.container.querySelector("#btn-call-video");n&&n.addEventListener("click",()=>{p.showCallModal("video",t)});const a=this.container.querySelector("#btn-chat-options");a&&a.addEventListener("click",g=>{g.stopPropagation();const C=a.getBoundingClientRect();this.openChatHeaderMenu(C.left-120,C.bottom+4,t)});const c=this.container.querySelector("#messages-scroll-area");c&&c.addEventListener("scroll",()=>{const g=c.scrollHeight-c.scrollTop-c.clientHeight;this.isUserScrolledUp=g>120,this.updateScrollBottomButton()});const r=this.container.querySelector("#btn-scroll-bottom");r&&r.addEventListener("click",()=>{this.scrollToBottom(!0)});const l=this.container.querySelector("#message-textarea"),m=this.container.querySelector("#btn-send-message"),h=this.container.querySelector("#btn-attach"),v=this.container.querySelector("#btn-voice-record"),b=this.container.querySelector("#btn-cancel-reply");b&&b.addEventListener("click",()=>{o.replyTo=null,this.updateReplyBar()});const x=()=>{l&&(l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,140)}px`)};l&&(l.addEventListener("input",x),l.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),this.handleSendMessage())})),m&&m.addEventListener("click",()=>{this.handleSendMessage()}),h&&h.addEventListener("click",g=>{g.stopPropagation(),p.showAttachMenu(h,C=>{this.handleAttachment(C)})}),v&&v.addEventListener("click",()=>{this.handleVoiceRecord()})}handleSendMessage(){const t=this.container.querySelector("#message-textarea");if(!t)return;const e=t.value.trim();e&&(o.sendMessage({text:e,type:"text",replyTo:o.replyTo}),t.value="",t.style.height="auto",o.replyTo=null,this.updateReplyBar(),t.focus())}handleAttachment(t){if(t==="photo"){const e=["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"],s=e[Math.floor(Math.random()*e.length)];o.sendMessage({text:"Фотография из галереи",type:"image",mediaUrl:s,replyTo:o.replyTo})}else t==="voice"?this.handleVoiceRecord():t==="file"?o.sendMessage({text:"📄 Документ: Project_Specification_2025.pdf (3.4 МБ)",type:"text",replyTo:o.replyTo}):t==="poll"?o.sendMessage({text:`📊 Опрос: Когда проводим релиз Clock Messenger?
1) Сегодня в 18:00
2) Завтра утром
3) В понедельник`,type:"text",replyTo:o.replyTo}):t==="error-test"&&o.sendMessage({text:"Тестовое сообщение с ошибкой сети",type:"text",simulateError:!0,replyTo:o.replyTo})}handleVoiceRecord(){p.showToast("Голосовое сообщение записано");const t=Math.floor(12+Math.random()*25);o.sendMessage({text:"",type:"voice",duration:t,replyTo:o.replyTo})}setReplyTo(t){o.replyTo=t,this.updateReplyBar();const e=this.container.querySelector("#message-textarea");e&&e.focus()}updateReplyBar(){const t=this.container.querySelector("#reply-preview-bar"),e=this.container.querySelector("#reply-author-name"),s=this.container.querySelector("#reply-snippet-text");t&&(o.replyTo?(t.style.display="flex",e&&(e.textContent=o.replyTo.senderName),s&&(s.textContent=o.replyTo.type==="voice"?"🎙 Голосовое сообщение":o.replyTo.text||"📷 Фото")):t.style.display="none")}bindMessageInteractions(){this.container.querySelectorAll(".message-row").forEach(t=>{this.bindSingleMessageEvents(t)})}bindSingleMessageEvents(t){const e=t.dataset.messageId,s=o.getActiveChat(),i=s?s.messages.find(l=>l.id===e):null,n=t.querySelector(".retry-send-btn");n&&n.addEventListener("click",l=>{l.stopPropagation(),o.retryMessage(e)});const a=t.querySelector(".message-preview-img");a&&i&&a.addEventListener("click",()=>{p.showImageZoom(a.src,i.text)});const c=t.querySelector(".voice-message-player");if(c&&i){const l=c.querySelector(".voice-play-btn"),m=c.querySelector(".voice-progress-fill"),h=c.querySelector(".voice-wave-bars"),v=c.querySelector(".voice-duration"),b=l.querySelector(".play-icon"),x=l.querySelector(".pause-icon");l.addEventListener("click",g=>{if(g.stopPropagation(),l.classList.toggle("playing")){b.style.display="none",x.style.display="block",h.classList.add("animating");let k=0;const L=i.duration||20;m.style.width="0%";const q=setInterval(()=>{k+=.2;const _=Math.min(100,k/L*100);m.style.width=`${_}%`;const A=Math.floor(k);v.textContent=`${Math.floor(A/60)}:${String(A%60).padStart(2,"0")}`,k>=L&&(clearInterval(q),l.classList.remove("playing"),b.style.display="block",x.style.display="none",h.classList.remove("animating"),m.style.width="0%",v.textContent=`${Math.floor(L/60)}:${String(L%60).padStart(2,"0")}`)},200);this.activeVoiceAudios.set(e,q)}else this.activeVoiceAudios.has(e)&&(clearInterval(this.activeVoiceAudios.get(e)),this.activeVoiceAudios.delete(e)),b.style.display="block",x.style.display="none",h.classList.remove("animating")})}const r=t.querySelector(".message-reply-quote");r&&r.addEventListener("click",l=>{l.stopPropagation();const m=r.dataset.quoteId,h=this.container.querySelector(`[data-message-id="${m}"]`);h&&(h.scrollIntoView({behavior:"smooth",block:"center"}),h.classList.add("highlight-target"),setTimeout(()=>h.classList.remove("highlight-target"),1500))}),t.addEventListener("contextmenu",l=>{l.preventDefault(),this.openMessageContextMenu(l.clientX,l.clientY,e)})}openMessageContextMenu(t,e,s){this.activeContextMenu&&(this.activeContextMenu.remove(),this.activeContextMenu=null);const i=o.getActiveChat();if(!i)return;const n=i.messages.find(r=>r.id===s);if(!n)return;const a=document.createElement("div");a.className="context-menu",a.style.left=`${Math.min(t,window.innerWidth-200)}px`,a.style.top=`${Math.min(e,window.innerHeight-200)}px`,a.innerHTML=`
      <button class="context-item" data-action="reply">
        <span class="context-icon">↩️</span>
        <span>Ответить</span>
      </button>
      <button class="context-item" data-action="forward">
        <span class="context-icon">↗️</span>
        <span>Переслать</span>
      </button>
      ${n.text?`
        <button class="context-item" data-action="copy">
          <span class="context-icon">📋</span>
          <span>Копировать</span>
        </button>
      `:""}
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить</span>
      </button>
    `,document.body.appendChild(a),this.activeContextMenu=a;const c=r=>{a.contains(r.target)||(a.remove(),this.activeContextMenu=null,document.removeEventListener("click",c))};setTimeout(()=>document.addEventListener("click",c),10),a.querySelectorAll(".context-item").forEach(r=>{r.addEventListener("click",()=>{const l=r.dataset.action;a.remove(),this.activeContextMenu=null,document.removeEventListener("click",c),l==="reply"?this.setReplyTo(n):l==="forward"?p.showForwardModal(n.id):l==="copy"?navigator.clipboard&&n.text&&(navigator.clipboard.writeText(n.text),p.showToast("Текст скопирован")):l==="delete"&&p.showDeleteMessageConfirm(n.id)})})}openChatHeaderMenu(t,e,s){const i=document.createElement("div");i.className="context-menu",i.style.left=`${Math.min(t,window.innerWidth-200)}px`,i.style.top=`${Math.min(e,window.innerHeight-180)}px`,i.innerHTML=`
      <button class="context-item" data-action="profile">
        <span class="context-icon">👤</span>
        <span>Информация о чате</span>
      </button>
      <button class="context-item" data-action="pin">
        <span class="context-icon">${s.isPinned?"📌":"📍"}</span>
        <span>${s.isPinned?"Открепить":"Закрепить"}</span>
      </button>
      <button class="context-item" data-action="archive">
        <span class="context-icon">${s.isArchived?"📥":"📦"}</span>
        <span>${s.isArchived?"Разархивировать":"Архивировать"}</span>
      </button>
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить чат</span>
      </button>
    `,document.body.appendChild(i);const n=a=>{i.contains(a.target)||(i.remove(),document.removeEventListener("click",n))};setTimeout(()=>document.addEventListener("click",n),10),i.querySelectorAll(".context-item").forEach(a=>{a.addEventListener("click",()=>{const c=a.dataset.action;i.remove(),document.removeEventListener("click",n),c==="profile"?o.setScreen("profile"):c==="pin"?o.togglePinChat(s.id):c==="archive"?o.toggleArchiveChat(s.id):c==="delete"&&p.showDeleteChatConfirm(s.id)})})}}class O{constructor(t){this.container=t,this.activeTab="about",this.inContacts=!0,this.notificationsMuted=!1,this.init()}init(){this.render(),o.on("screenChanged",({screen:t})=>{t==="profile"&&this.render()})}render(){const t=o.getActiveChat();if(!t){this.container.innerHTML=`
        <div class="empty-state">
          <h4>Профиль не выбран</h4>
          <button class="btn btn-secondary" id="btn-profile-to-chats">Вернуться к чатам</button>
        </div>
      `;const n=this.container.querySelector("#btn-profile-to-chats");n&&n.addEventListener("click",()=>o.setScreen("chats"));return}const e=y(t.name),s=w(t.name),i=$(t.status);this.container.innerHTML=`
      <div class="profile-view-panel custom-scrollbar">
        <header class="profile-header-bar">
          <button class="icon-btn" id="btn-back-to-chat" title="Назад к чату">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3>Информация</h3>
          <button class="icon-btn" id="btn-profile-more" title="Параметры">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
        </header>

        <div class="profile-hero-section">
          <div class="profile-avatar-large" style="background: ${s};">
            ${e}
            ${t.status==="online"?'<span class="online-ring"></span>':""}
          </div>
          <h2 class="profile-user-name">${d(t.name)}</h2>
          <span class="profile-user-status ${t.status==="online"?"status-online":""}">${d(i)}</span>

          <div class="profile-quick-actions">
            <button class="profile-action-btn" id="btn-profile-call">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <span>Позвонить</span>
            </button>

            <button class="profile-action-btn" id="btn-profile-video">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <span>Видеозвонок</span>
            </button>

            <button class="profile-action-btn ${this.inContacts?"active":""}" id="btn-profile-contact">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <span id="label-contact-btn">${this.inContacts?"В контактах":"Добавить"}</span>
            </button>
          </div>
        </div>

        <div class="profile-tabs-nav">
          <button class="profile-tab ${this.activeTab==="about"?"active":""}" data-tab="about">О себе</button>
          <button class="profile-tab ${this.activeTab==="media"?"active":""}" data-tab="media">
            Медиа (${(t.mediaList||[]).length})
          </button>
          <button class="profile-tab ${this.activeTab==="files"?"active":""}" data-tab="files">
            Файлы (${(t.filesList||[]).length})
          </button>
          <button class="profile-tab ${this.activeTab==="links"?"active":""}" data-tab="links">
            Ссылки (${(t.linksList||[]).length})
          </button>
        </div>

        <div class="profile-tab-content" id="profile-tab-body">
          ${this.renderTabContent(t)}
        </div>
      </div>
    `,this.bindEvents(t)}renderTabContent(t){if(this.activeTab==="about")return`
        <div class="profile-info-card">
          <div class="info-row">
            <span class="info-label">О себе</span>
            <span class="info-value">${d(t.bio||"Информация не указана")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Имя пользователя</span>
            <span class="info-value info-link">@${d(t.username||"unknown")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Телефон / Статус связи</span>
            <span class="info-value">${d(t.phone||"Не указан")}</span>
          </div>
          <div class="info-row info-row-toggle">
            <div class="toggle-text">
              <span class="info-label">Уведомления</span>
              <span class="toggle-sub">${this.notificationsMuted?"Выключены":"Включены"}</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="profile-notif-switch" ${this.notificationsMuted?"":"checked"} />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      `;if(this.activeTab==="media"){const e=t.mediaList||[];return e.length===0?'<div class="empty-tab-hint">Нет медиафайлов в этом чате</div>':`
        <div class="profile-media-grid">
          ${e.map(s=>`
            <div class="media-thumb-item" data-url="${d(s.url)}">
              <img src="${d(s.url)}" alt="Фото" loading="lazy" />
              <span class="media-date-badge">${d(s.date)}</span>
            </div>
          `).join("")}
        </div>
      `}if(this.activeTab==="files"){const e=t.filesList||[];return e.length===0?'<div class="empty-tab-hint">Нет прикрепленных файлов</div>':`
        <div class="profile-files-list">
          ${e.map(s=>`
            <div class="file-item-row">
              <div class="file-icon-box">📁</div>
              <div class="file-details">
                <span class="file-name">${d(s.name)}</span>
                <span class="file-meta">${d(s.size)} • ${d(s.date)}</span>
              </div>
              <button class="icon-btn download-file-btn" title="Скачать">⬇</button>
            </div>
          `).join("")}
        </div>
      `}if(this.activeTab==="links"){const e=t.linksList||[];return e.length===0?'<div class="empty-tab-hint">Нет общих ссылок</div>':`
        <div class="profile-links-list">
          ${e.map(s=>`
            <a href="${d(s.url)}" target="_blank" rel="noopener noreferrer" class="link-item-row">
              <div class="link-icon-box">🔗</div>
              <div class="link-details">
                <span class="link-title">${d(s.title)}</span>
                <span class="link-domain">${d(s.domain||s.url)}</span>
              </div>
            </a>
          `).join("")}
        </div>
      `}return""}bindEvents(t){const e=this.container.querySelector("#btn-back-to-chat");e&&e.addEventListener("click",()=>{o.setScreen("chat",t.id)});const s=this.container.querySelector("#btn-profile-call");s&&s.addEventListener("click",()=>{p.showCallModal("audio",t)});const i=this.container.querySelector("#btn-profile-video");i&&i.addEventListener("click",()=>{p.showCallModal("video",t)});const n=this.container.querySelector("#btn-profile-contact");n&&n.addEventListener("click",()=>{this.inContacts=!this.inContacts,n.classList.toggle("active",this.inContacts);const c=this.container.querySelector("#label-contact-btn");c&&(c.textContent=this.inContacts?"В контактах":"Добавить"),p.showToast(this.inContacts?"Контакт сохранен":"Контакт удален из списка")});const a=this.container.querySelectorAll(".profile-tab");a.forEach(c=>{c.addEventListener("click",()=>{a.forEach(l=>l.classList.remove("active")),c.classList.add("active"),this.activeTab=c.dataset.tab;const r=this.container.querySelector("#profile-tab-body");r&&(r.innerHTML=this.renderTabContent(t),this.bindTabBodyEvents())})}),this.bindTabBodyEvents()}bindTabBodyEvents(){const t=this.container.querySelector("#profile-notif-switch");t&&t.addEventListener("change",e=>{this.notificationsMuted=!e.target.checked;const s=this.container.querySelector(".toggle-sub");s&&(s.textContent=this.notificationsMuted?"Выключены":"Включены"),p.showToast(this.notificationsMuted?"Уведомления отключены":"Уведомления включены")}),this.container.querySelectorAll(".media-thumb-item").forEach(e=>{e.addEventListener("click",()=>{const s=e.dataset.url;p.showImageZoom(s,"Медиа из диалога")})}),this.container.querySelectorAll(".download-file-btn").forEach(e=>{e.addEventListener("click",()=>{p.showToast("Загрузка файла начата...")})})}}class R{constructor(t){this.container=t,this.init()}init(){this.render(),o.on("screenChanged",({screen:t})=>{t==="settings"&&this.render()}),o.on("userUpdated",()=>this.render()),o.on("settingsUpdated",()=>this.render())}render(){const t=o.user,e=o.settings,s=y(t.name),i=w(t.name);this.container.innerHTML=`
      <div class="settings-view-panel custom-scrollbar">
        <header class="settings-header-bar">
          <button class="icon-btn" id="btn-back-from-settings" title="Назад">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3>Настройки</h3>
          <div style="width: 36px;"></div>
        </header>

        <div class="settings-content-wrapper">
          <!-- Account Section -->
          <div class="settings-section">
            <div class="settings-account-card">
              <div class="settings-avatar-large" style="background: ${i};">
                ${s}
              </div>
              <div class="settings-user-info">
                <h3 class="settings-user-name">${d(t.name)}</h3>
                <span class="settings-user-phone">${d(t.phone||"+7 (912) 345-67-89")}</span>
                <span class="settings-user-handle">@${d(t.username)}</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-edit-my-profile">Редактировать</button>
            </div>
            ${t.bio?`<p class="settings-bio-text">${d(t.bio)}</p>`:""}
          </div>

          <!-- Theme & Appearance -->
          <div class="settings-section">
            <div class="settings-section-title">Оформление</div>
            
            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Тёмная тема (Clock Dark)</span>
                <span class="row-sub">Графитово-синяя палитра интерфейса</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-theme-switch" ${e.theme==="dark"?"checked":""} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row flex-column">
              <div class="settings-row-text">
                <span class="row-label">Размер шрифта</span>
                <span class="row-sub">Масштабирование текста сообщений</span>
              </div>
              <div class="font-size-picker">
                <button class="font-size-btn ${e.fontSize==="14px"?"active":""}" data-size="14px">Маленький</button>
                <button class="font-size-btn ${e.fontSize==="15px"?"active":""}" data-size="15px">Стандартный</button>
                <button class="font-size-btn ${e.fontSize==="17px"?"active":""}" data-size="17px">Крупный</button>
              </div>
            </div>
          </div>

          <!-- Privacy -->
          <div class="settings-section">
            <div class="settings-section-title">Конфиденциальность и звуки</div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Показывать статус «В сети»</span>
                <span class="row-sub">Другие пользователи видят, когда вы онлайн</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-online-switch" ${e.showOnlineStatus?"checked":""} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Звук уведомлений</span>
                <span class="row-sub">Звуковые эффекты при отправке и получении</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-sound-switch" ${e.soundEnabled?"checked":""} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Автозагрузка медиа</span>
                <span class="row-sub">Автоматически скачивать фото и аудио</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-media-switch" ${e.autoDownloadMedia?"checked":""} />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <!-- Interface & Language -->
          <div class="settings-section">
            <div class="settings-section-title">Интерфейс и язык</div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Язык приложения</span>
                <span class="row-sub">Текущий язык отображения</span>
              </div>
              <select id="setting-lang-select" class="form-select">
                <option value="ru" ${e.language==="ru"?"selected":""}>Русский (RU)</option>
                <option value="en" ${e.language==="en"?"selected":""}>English (EN)</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="settings-section">
            <button class="btn-settings-action text-danger" id="btn-logout-session">
              <span class="action-icon">🚪</span>
              <span>Выйти из аккаунта</span>
            </button>
            <button class="btn-settings-action" id="btn-reset-demo-data">
              <span class="action-icon">🔄</span>
              <span>Сбросить данные к начальным</span>
            </button>
          </div>

          <div class="settings-footer-info">
            <p>Clock Messenger Prototype v2.4</p>
            <p>Native ES Modules • No Frameworks • Pure Web</p>
          </div>
        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const t=this.container.querySelector("#btn-back-from-settings");t&&t.addEventListener("click",()=>{o.setScreen("chats")});const e=this.container.querySelector("#btn-edit-my-profile");e&&e.addEventListener("click",()=>{p.showEditProfileModal()});const s=this.container.querySelector("#setting-theme-switch");s&&s.addEventListener("change",h=>{const v=h.target.checked?"dark":"light";o.updateSettings({theme:v}),p.showToast(v==="dark"?"Включена тёмная тема":"Включена светлая тема")}),this.container.querySelectorAll(".font-size-btn").forEach(h=>{h.addEventListener("click",()=>{const v=h.dataset.size;o.updateSettings({fontSize:v}),p.showToast(`Размер шрифта: ${h.textContent}`)})});const n=this.container.querySelector("#setting-online-switch");n&&n.addEventListener("change",h=>{o.updateSettings({showOnlineStatus:h.target.checked}),p.showToast(h.target.checked?"Статус «В сети» отображается":"Статус «В сети» скрыт")});const a=this.container.querySelector("#setting-sound-switch");a&&a.addEventListener("change",h=>{o.updateSettings({soundEnabled:h.target.checked}),h.target.checked?(f.playSent(),p.showToast("Звуки уведомлений включены")):p.showToast("Звуки уведомлений выключены")});const c=this.container.querySelector("#setting-media-switch");c&&c.addEventListener("change",h=>{o.updateSettings({autoDownloadMedia:h.target.checked}),p.showToast(h.target.checked?"Автозагрузка медиа включена":"Автозагрузка медиа выключена")});const r=this.container.querySelector("#setting-lang-select");r&&r.addEventListener("change",h=>{o.updateSettings({language:h.target.value}),p.showToast(`Язык изменен на ${h.target.value.toUpperCase()}`)});const l=this.container.querySelector("#btn-logout-session");l&&l.addEventListener("click",()=>{p.showToast("Сессия завершена. Возврат к чатам..."),setTimeout(()=>{o.setScreen("chats")},500)});const m=this.container.querySelector("#btn-reset-demo-data");m&&m.addEventListener("click",()=>{o.resetAllData(),p.showToast("Данные сброшены к исходным")})}}class Y{constructor(){this.appRoot=document.getElementById("app"),this.chatListComponent=null,this.chatViewComponent=null,this.profileViewComponent=null,this.settingsViewComponent=null}init(){o.applySettingsToDOM(),this.renderBaseLayout(),this.initComponents(),this.bindNavigation(),this.updateScreenVisibility(o.currentScreen),window.innerWidth>900&&!o.activeChatId&&o.chats.length>0&&o.setScreen("chat",o.chats[0].id)}renderBaseLayout(){this.appRoot.innerHTML=`
      <div class="clock-app-layout" id="clock-layout">
        <!-- Sidebar: Chat List -->
        <aside class="app-sidebar screen-panel" id="screen-chats">
          <!-- Chat list component injected here -->
        </aside>

        <!-- Main Content Area -->
        <main class="app-main screen-panel" id="screen-main">
          <div class="view-container" id="chat-view-container">
            <!-- Chat view component injected here -->
          </div>
          <div class="view-container" id="profile-view-container" style="display: none;">
            <!-- Profile view component injected here -->
          </div>
          <div class="view-container" id="settings-view-container" style="display: none;">
            <!-- Settings view component injected here -->
          </div>
        </main>
      </div>
      <div id="modal-portal"></div>
    `,p.init(document.getElementById("modal-portal"))}initComponents(){const t=document.getElementById("screen-chats"),e=document.getElementById("chat-view-container"),s=document.getElementById("profile-view-container"),i=document.getElementById("settings-view-container");this.chatListComponent=new F(t),this.chatViewComponent=new z(e),this.profileViewComponent=new O(s),this.settingsViewComponent=new R(i)}bindNavigation(){o.on("screenChanged",({screen:t})=>{this.updateScreenVisibility(t)}),window.addEventListener("resize",()=>{this.updateScreenVisibility(o.currentScreen)})}updateScreenVisibility(t){const e=document.getElementById("clock-layout"),s=document.getElementById("screen-chats"),i=document.getElementById("screen-main"),n=document.getElementById("chat-view-container"),a=document.getElementById("profile-view-container"),c=document.getElementById("settings-view-container"),r=window.innerWidth<=900;n.style.display="none",a.style.display="none",c.style.display="none",t==="chat"?n.style.display="flex":t==="profile"?a.style.display="flex":t==="settings"&&(c.style.display="flex"),r?t==="chats"?(s.style.display="flex",i.style.display="none",e.setAttribute("data-active-view","chats")):(s.style.display="none",i.style.display="flex",e.setAttribute("data-active-view",t)):(s.style.display="flex",i.style.display="flex",t==="chats"&&(n.style.display="flex"),e.setAttribute("data-active-view","desktop"))}}document.addEventListener("DOMContentLoaded",()=>{new Y().init()});
