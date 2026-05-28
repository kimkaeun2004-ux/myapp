"use client";

import { ensureLoggedIn } from "@/lib/auth/session";
import { DEFAULT_AVATAR } from "@/lib/profile/storage";
import {
  loadUserProfile,
  saveUserProfileForAccount,
} from "@/lib/profile/user-profile";
import {
  formatTicketDateFromId,
  ticketGridHeadline,
  ticketGridTitle,
  type StoredTicket,
} from "@/lib/tickets/storage";
import { loadUserTickets } from "@/lib/tickets/user-tickets";
import { gradientFromEmotionParam } from "@/app/create/_shared/ticket-gradient";
import {
  YEOUN_AVATAR,
  YEOUN_BLOCK_GAP,
  YEOUN_BTN,
  YEOUN_CONTENT_W,
  YEOUN_PAGE_MAIN,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_NAV_BACK_PAGE,
  YEOUN_TEXT,
  YEOUN_TICKET,
  yeounFont,
} from "@/lib/ui/yeoun-scale";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("게스트");
  const [draftName, setDraftName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(DEFAULT_AVATAR);
  const [tickets, setTickets] = useState<StoredTicket[]>([]);

  const refreshTickets = useCallback(async () => {
    setTickets(await loadUserTickets());
  }, []);

  useEffect(() => {
    const init = async () => {
      const ok = await ensureLoggedIn(router.replace);
      if (!ok) return;

      const profile = await loadUserProfile();
      setDisplayName(profile.displayName);
      setDraftName(profile.displayName);
      setAvatarUrl(profile.avatarUrl);
      setDraftAvatarUrl(profile.avatarUrl);
      await refreshTickets();
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname !== "/profile") return;
    void refreshTickets();
  }, [pathname, refreshTickets]);

  useEffect(() => {
    const onFocus = () => void refreshTickets();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshTickets();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshTickets]);

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
    void saveUserProfileForAccount(nextProfile);
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
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className={YEOUN_PAGE_MAIN}>
        <section className={`${YEOUN_SHELL_SECTION} overflow-y-auto`}>
          <header className="relative shrink-0">
            <h1 className={`mt-[5.4cqh] text-center ${YEOUN_TEXT.brandHome}`}>YEOUN</h1>
            <button
              type="button"
              onClick={() => router.push("/main")}
              className={YEOUN_NAV_BACK_PAGE}
              aria-label="뒤로"
            >
              ‹
            </button>
          </header>

          <div className={`mx-auto mt-[5.2cqh] flex ${YEOUN_CONTENT_W} items-center gap-[3cqw]`}>
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={!isEditing}
              className={`relative ${YEOUN_AVATAR} disabled:cursor-default ${
                isEditing ? "ring-2 ring-[#FDAFC7]" : ""
              }`}
            >
              {shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shownAvatar} alt="프로필" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">🧸</span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className={`w-full border-b border-[#FDAFC7] bg-transparent ${YEOUN_TEXT.title} outline-none`}
                  placeholder="이름"
                />
              ) : (
                <p className={YEOUN_TEXT.title}>{displayName} 님</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEditToggle}
              className={`shrink-0 rounded-[2cqw] border border-[#FDAFC7] bg-white px-[3cqw] py-[1.2cqh] ${YEOUN_TEXT.body} text-[#FDAFC7] transition hover:bg-[#fff7fa] active:scale-[0.99]`}
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
            className={`mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#FDAFC7] text-[#131313]`}
          >
            티켓 피드
          </div>

          {gridTickets.length > 0 ? (
            <section
              className={`${YEOUN_BLOCK_GAP} mx-auto grid ${YEOUN_CONTENT_W} grid-cols-3 gap-[2.1cqw]`}
            >
              {gridTickets.map((ticket, idx) => (
                <article
                  key={ticket.id ?? idx}
                  className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2cqw] border border-[#ece8e1] px-[1.4cqw] py-[1.2cqh] text-center shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                  style={{ backgroundImage: gradientFromEmotionParam(ticket.emotions || null) }}
                >
                  <p className={`line-clamp-1 ${YEOUN_TICKET.label} leading-tight`}>
                    {ticketGridTitle(ticket)}
                  </p>
                  <p className={`mt-[0.5cqh] ${YEOUN_TICKET.headline}`}>
                    {ticketGridHeadline(ticket)}
                  </p>
                  <p className={`mt-[0.5cqh] ${YEOUN_TICKET.meta}`}>
                    {formatTicketDateFromId(ticket.id)}
                  </p>
                  {ticket.quote ? (
                    <p className={`mt-[0.4cqh] line-clamp-2 w-full ${YEOUN_TICKET.meta}`}>
                      {ticket.quote}
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
          ) : (
            <section
              className={`mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] shadow-[0_12px_24px_rgba(0,0,0,0.08)]`}
            >
              아직 발행한 티켓이 없어요.
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
