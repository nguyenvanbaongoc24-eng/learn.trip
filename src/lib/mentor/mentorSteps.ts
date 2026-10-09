// Pre-configured mentor tour steps for Learn.Trip
import { MentorStep, MentorTourDef } from "./mentorTypes";

export const initialWelcomeTour: MentorTourDef = {
  id: "first_time_welcome",
  name: "Chào đón thành viên mới",
  steps: [
    {
      id: "step-greeting",
      title: {
        vi: "Chào bạn nhỏ! Mình là Kim Quy 🐢",
        en: "Hello adventurer! I am Kim Quy 🐢",
      },
      message: {
        vi: "Mình là thần Rùa Vàng, sẽ cùng bạn du ngoạn khắp Việt Nam và học tiếng Anh siêu vui!",
        en: "I am the Golden Turtle, and I will guide you across Vietnam while learning English!",
      },
      voiceText: {
        vi: "Chào bạn nhỏ! Mình là thần Rùa Vàng Kim Quy, sẽ cùng bạn du ngoạn khắp Việt Nam và học tiếng Anh thật vui!",
        en: "Hello adventurer! I will guide you across Vietnam while learning English!",
      },
      placement: "center",
      mood: "waving",
      mode: "both",
      waitFor: "next_button",
      actionLabel: { vi: "Làm quen với Rùa Vàng ✨", en: "Meet Kim Quy ✨" },
    },
    {
      id: "step-pick-mode",
      title: {
        vi: "Bạn đang học lớp mấy?",
        en: "What grade are you in?",
      },
      message: {
        vi: "Chọn để Kim Quy chuẩn bị cách hướng dẫn phù hợp nhất cho bạn nhé!",
        en: "Choose so Kim Quy can prepare the best guidance style for you!",
      },
      voiceText: {
        vi: "Bạn đang học lớp mấy? Hãy chọn để mình hướng dẫn phù hợp nhất nhé!",
        en: "What grade are you in? Choose so I can prepare the best journey for you!",
      },
      placement: "center",
      mood: "happy",
      mode: "both",
      waitFor: "custom",
    },
    {
      id: "step-spotlight-journey",
      targetSelector: "#continue-journey-btn",
      title: {
        vi: "Bắt đầu hành trình tại đây!",
        en: "Start your adventure here!",
      },
      message: {
        vi: "Chạm vào nút màu cam này để bắt đầu khám phá địa danh đầu tiên nhé!",
        en: "Tap this orange button to start exploring your first destination!",
      },
      voiceText: {
        vi: "Chạm vào nút màu cam này để bắt đầu khám phá địa danh đầu tiên nhé!",
        en: "Tap this button to start exploring your first destination!",
      },
      placement: "bottom",
      mood: "pointing",
      mode: "both",
      waitFor: "click_target",
      actionLabel: { vi: "Đi thôi nào! 🚀", en: "Let's go! 🚀" },
    },
    {
      id: "step-menu-tour",
      targetSelector: "#main-navigation-tabs",
      title: {
        vi: "Thanh hành trang của bạn 🎒",
        en: "Your Adventure Pack 🎒",
      },
      message: {
        vi: "Khám phá bản đồ, sưu tập tem Hộ Chiếu và nhận thưởng Thử Thách mỗi ngày!",
        en: "Explore the map, collect Passport stamps, and earn Challenge rewards daily!",
      },
      voiceText: {
        vi: "Dưới đây là thanh hành trang: gồm Khám phá, Hộ chiếu du lịch, Thử thách và Hồ sơ của bạn!",
        en: "Here is your navigation pack: Explore, Passport stamps, Challenges, and Profile!",
      },
      placement: "top",
      mood: "cheering",
      mode: "both",
      waitFor: "next_button",
      actionLabel: { vi: "Mình đã sẵn sàng! 🎉", en: "I am ready! 🎉" },
    },
  ],
};

// Help descriptions for each main screen when learner presses the Mentor Help button
export const screenHelpMessages: Record<
  string,
  { title: { vi: string; en: string }; message: { vi: string; en: string } }
> = {
  explore: {
    title: { vi: "Trang Khám Phá 🗺️", en: "Explore Screen 🗺️" },
    message: {
      vi: "Hãy bấm nút 'Tiếp tục khám phá' hoặc chọn một địa danh bên dưới để bắt đầu học bài và trả lời câu đố nhé!",
      en: "Tap 'Continue Journey' or select a destination below to learn words and solve quests!",
    },
  },
  passport: {
    title: { vi: "Hộ Chiếu Thám Hiểm 🛂", en: "Explorer Passport 🛂" },
    message: {
      vi: "Đây là cuốn sổ lưu niệm của bạn! Mỗi khi vượt qua thử thách ở một địa danh, bạn sẽ được đóng dấu vàng vào đây.",
      en: "This is your souvenir book! Conquering each destination unlocks an authentic golden stamp.",
    },
  },
  challenges: {
    title: { vi: "Đấu Trường Thử Thách 🏆", en: "Challenges Arena 🏆" },
    message: {
      vi: "Hoàn thành các nhiệm vụ mỗi ngày để nhận thêm sao kinh nghiệm (XP) và nâng cao thứ hạng nhé!",
      en: "Complete daily quests to earn bonus XP stars and climb the leaderboard!",
    },
  },
  profile: {
    title: { vi: "Hồ Sơ Nhà Du Hành 👤", en: "Adventurer Profile 👤" },
    message: {
      vi: "Xem cấp độ, chuỗi ngày phiêu lưu và tùy chỉnh hình đại diện thú cưng ngộ nghĩnh của bạn tại đây.",
      en: "Check your explorer level, adventure streak, and customize your cute pet avatar here.",
    },
  },
};
