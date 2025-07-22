import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { apiBaseUrl } from '@/lib/utils';

// اجعل Pusher متاحاً عالمياً لـ laravel-echo
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Pusher = Pusher;
}

let echo: Echo<any> | null = null;
let currentToken: string | null = null;

export function getEchoInstance(token: string) {
  // إذا كان هناك اتصال موجود، أرجعه مباشرة (لا نقطع الاتصال أبداً)
  if (echo) {
    return echo;
  }
  echo = new Echo<any>({
    broadcaster: 'pusher',
    key: 'ffed1cc95f5337153c21',
    cluster: 'ap2',
    forceTLS: true,
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // احفظ التوكن الحالي
  currentToken = token;

  return echo;
}

// دالة لقطع الاتصال عند تسجيل الخروج
export function disconnectEcho() {
  if (echo) {
    echo.disconnect();
    echo = null;
    currentToken = null;
  }
}

// دالة للتحقق من حالة الاتصال
export function isEchoConnected(): boolean {
  return echo !== null;
}


// 'paths' => ['api/*', 'sanctum/csrf-cookie'],

//   'allowed_methods' => ['*'],

//     'allowed_origins' => ['*'],

//       'allowed_origins_patterns' => [],

//         'allowed_headers' => ['*'],

//           'exposed_headers' => [],

//             'max_age' => 0,

//               'supports_credentials' => false,


// <?php

// namespace App\Events;

// use App\Models\Message;
// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Broadcasting\PresenceChannel;
// use Illuminate\Broadcasting\PrivateChannel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;

// class MessageCreated implements ShouldBroadcast {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//   public $message;
//   /**
//    * Create a new event instance.
//    */
//   public function __construct(Message $message) {
//     //
//     $this -> message = $message;
//   }

//   /**
//    * Get the channels the event should broadcast on.
//    *
//    * @return array<int, \Illuminate\Broadcasting\Channel>
//    */
//   public function broadcastOn() {
//     $other_user = $this -> message -> conversation -> participants() -> where('user_id', '<>', $this -> message -> user_id) -> first();

//     return new PresenceChannel('Messenger.'.$other_user -> id);
//   }

//   public function broadcastAs() {
//     return 'new-message';
//   }
// }
