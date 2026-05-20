"use client";

import { ensureLoggedIn, resolveAuthDisplayName } from "@/lib/auth/session";
import {
  DEFAULT_AVATAR,
  loadUserProfile,
  saveUserProfile,
} from "@/lib/profile/storage";
import {
  formatTicketDateFromId,
  loadStoredTickets,
  ticketGridHeadline,
  ticketGridTitle,
  type StoredTicket,
} from "@/lib/tickets/storage";
import { gradientFromEmotionParam } from "@/app/create/_shared/ticket-gradient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** 메인 홈과 동일한 블록·버튼 스펙 */
const BLOCK_GAP = "mt-[3.2cqh]";
const MAIN_BTN =
  "mx-auto flex h-[min(80px,9dvh)] min-h-[56px] w-[84.6cqw] items-center justify-center rounded-[2.2cqw] text-[4.8cqw] font-extrabold tracking-[-0.02em]";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("게스트");
  const [draftName, setDraftName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(DEFAULT_AVATAR);
  const [tickets, setTickets] = useState<StoredTicket[]>([]);

  useEffect(() => {
    const init = async () => {
      const ok = await ensureLoggedIn(router.replace);
      if (!ok) return;

      const fallback = await resolveAuthDisplayName();
      const profile = loadUserProfile(fallback);
      setDisplayName(profile.displayName);
      setDraftName(profile.displayName);
      setAvatarUrl(profile.avatarUrl);
      setDraftAvatarUrl(profile.avatarUrl);
      setTickets(loadStoredTickets());
    };

    void init();
  }, [router]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setDraftName(displayName);
      setDraftAvatarUrl(avatarUrl);
      setIsEditing(true);
      return;
    }

    const nextName = draftName.trim() || displayName;
    const nextProfile = {
      displayName: nextName,
      avatarUrl: draftAvatarUrl,
    };
    saveUserProfile(nextProfile);
    setDisplayName(nextName);
    setAvatarUrl(draftAvatarUrl);
    setIsEditing(false);
  };

  const handleAvatarPick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const gridTickets = tickets.slice(0, 9);
  const shownAvatar = isEditing ? draftAvatarUrl : avatarUrl;

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className="relative flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col overflow-y-auto bg-[#FFFFF5] [container-type:size]">
          <button
            type="button"
            onClick={() => router.push("/main")}
            className="mt-[5.4cqh] px-[6.2cqw] text-left text-[6.4cqw] font-semibold leading-none text-[#FDAFC7]"
            aria-label="뒤로"
          >
            ‹
          </button>

          <div className="mx-auto mt-[5.2cqh] flex w-[84.6cqw] items-center gap-[3cqw]">
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={!isEditing}
              className={`relative h-[22cqw] w-[22cqw] shrink-0 overflow-hidden rounded-[2.2cqw] bg-[#ece9df] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] disabled:cursor-default ${
                isEditing ? "ring-2 ring-[#FDAFC7]" : ""
              }`}
            >
              {shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shownAvatar} alt="프로필" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10cqw]">
                  🧸
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full border-b border-[#FDAFC7] bg-transparent text-[4.8cqw] font-bold tracking-[-0.02em] outline-none"
                  placeholder="이름"
                />
              ) : (
                <p className="text-[4.8cqw] font-bold tracking-[-0.02em]">{displayName} 님</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEditToggle}
              className="shrink-0 rounded-[2.2cqw] border border-[#FDAFC7] bg-white px-[3.6cqw] py-[1.8cqh] text-[3.2cqw] font-bold tracking-[-0.01em] text-[#FDAFC7] transition hover:bg-[#fff7fa] active:scale-[0.99]"
            >
              {isEditing ? "저장" : "프로필 편집"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div
            className={`${MAIN_BTN} ${BLOCK_GAP} border border-[#FDAFC7] bg-[#FDAFC7] text-[#131313]`}
          >
            티켓 피드
          </div>

          {gridTickets.length > 0 ? (
            <section className={`${BLOCK_GAP} mx-auto grid w-[84.6cqw] grid-cols-3 gap-[2.1cqw]`}>
              {gridTickets.map((ticket, idx) => (
                <article
                  key={ticket.id ?? idx}
                  className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2.2cqw] border border-[#ece8e1] px-[1.4cqw] py-[1.2cqh] text-center shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                  style={{ backgroundImage: gradientFromEmotionParam(ticket.emotions || null) }}
                >
                  <p className="line-clamp-1 text-[2cqw] font-bold leading-tight">
                    {ticketGridTitle(ticket)}
                  </p>
                  <p className="mt-[0.5cqh] text-[4.2cqw] font-black leading-none">
                    {ticketGridHeadline(ticket)}
                  </p>
                  <p className="mt-[0.5cqh] text-[1.8cqw] font-semibold">
                    {formatTicketDateFromId(ticket.id)}
                  </p>
                  {ticket.quote ? (
                    <p className="mt-[0.4cqh] line-clamp-2 w-full text-[1.6cqw] font-medium leading-snug">
                      {ticket.quote}
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
          ) : (
            <section
              className={`${MAIN_BTN} ${BLOCK_GAP} border border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] shadow-[0_12px_24px_rgba(0,0,0,0.08)]`}
            >
              아직 발행한 티켓이 없어요.
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
