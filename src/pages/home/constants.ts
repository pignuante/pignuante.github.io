export interface HomeMenuItem {
  desc: string;
  label: string;
  path: string;
}

export const HOME_MENU_ITEMS: ReadonlyArray<HomeMenuItem> = [
  { desc: "모험가 소개", label: "NEW GAME", path: "/about" },
  { desc: "프로젝트 목록", label: "QUEST LOG", path: "/projects" },
  { desc: "여행 지도", label: "WORLD MAP", path: "/travel" },
];

export const HOME_INTRO_TEXT: string =
  "안녕하세요! PignuAnte의 픽셀 세계에 오신 것을 환영합니다.\n이곳은 개발자이자 여행자의 디지털 공간입니다.\n프로젝트와 여행 기록, 그리고 다양한 이야기들이\n여러분을 기다리고 있습니다. ★";
