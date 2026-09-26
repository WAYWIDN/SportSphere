import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  coachApi,
  type CoachProfileData,
  type CoachSlotData,
  type SessionRequestItem,
  type CreateCoachSlotInput,
} from "../api/coach.api";
import { useAuth } from "../../../context/AuthContext";
import AccessDeniedCard from "../components/AccessDeniedCard";
import DashboardTabs from "../components/DashboardTabs";
import type { TabKey } from "../components/DashboardTabs";
import CreateSlotForm from "../components/CreateSlotForm";
import SlotListSection from "../components/SlotListSection";
import SessionRequestsSection from "../components/SessionRequestsSection";
import CoachProfileForm from "../components/CoachProfileForm";

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("slots");

  // Profile Form States
  const [profile, setProfile] = useState<CoachProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState<number | "">("");
  const [sportsInput, setSportsInput] = useState("");
  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerCity, setCenterCity] = useState("");
  const [centerState, setCenterState] = useState("");
  const [profileImages, setProfileImages] = useState<File[]>([]);

  // Slots Management States
  const todayStr = new Date().toISOString().slice(0, 10);
  const [filterDate, setFilterDate] = useState<string>("");
  const [slots, setSlots] = useState<CoachSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNextSlots, setHasNextSlots] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  // New Slot Form States
  const [newSlotDate, setNewSlotDate] = useState(todayStr);
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("10:00");
  const [creatingSlot, setCreatingSlot] = useState(false);

  // Session Requests States
  const [requests, setRequests] = useState<SessionRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user && user.role === "coach" && user.id) {
      fetchMyProfile(user.id);
      fetchMySlots();
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyProfile = async (coachId: string) => {
    setLoadingProfile(true);

    try {
      const res = await coachApi.getProfile(coachId);
      if (res.success && res.data) {
        setProfile(res.data);
        setBio(res.data.bio || "");
        setExperience(res.data.experience ?? "");
        setSportsInput(res.data.sports ? res.data.sports.join(", ") : "");
        setCenterName(res.data.coachingCenter?.name || "");
        setCenterAddress(res.data.coachingCenter?.address || "");
        setCenterCity(res.data.coachingCenter?.city || "");
        setCenterState(res.data.coachingCenter?.state || "");
      }
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchMySlots = async (dateParam?: string, cursor?: number) => {
    setLoadingSlots(true);

    if (cursor === undefined) {
      setCurrentPage(1);
      setCursorHistory([undefined]);
    }

    setNextCursor(null);
    setHasNextSlots(false);

    try {
      const res = await coachApi.getMySlots(dateParam, cursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load slots");

      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNextSlots || nextCursor === null || loadingPage) {
      return;
    }

    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;

    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getMySlots(filterDate, nextCursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load next page");
    } finally {
      setLoadingPage(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || loadingPage) {
      return;
    }

    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];
    setCurrentPage(prevPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getMySlots(filterDate, prevCursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load previous page",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoadingRequests(true);

    try {
      const res = await coachApi.getCoachSessionRequests();

      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load session requests",
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const sportsList = sportsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (sportsList.length === 0) {
      toast.error("Please enter at least one sport");
      return;
    }

    if (experience === "") {
      toast.error("Please enter years of experience");
      return;
    }

    setSavingProfile(true);

    try {
      const payload = {
        bio,
        experience: Number(experience),
        sports: sportsList,
        coachingCenter: {
          name: centerName,
          address: centerAddress,
          city: centerCity,
          state: centerState,
        },
      };

      if (profile) {
        const res = await coachApi.updateProfile(payload);

        if (res.success) {
          toast.success("Coach profile updated successfully!");

          setProfile(res.data);
        }
      } else {
        const res = await coachApi.createProfile(payload);

        if (res.success) {
          toast.success("Coach profile created successfully!");

          setProfile(res.data);
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save coach profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSlotDate || !startTimeStr || !endTimeStr) {
      toast.error("Please fill in slot date and times");
      return;
    }

    const startEpoch = new Date(`${newSlotDate}T${startTimeStr}:00`).getTime();

    const endEpoch = new Date(`${newSlotDate}T${endTimeStr}:00`).getTime();

    if (endEpoch <= startEpoch) {
      toast.error("End time must be after start time");
      return;
    }

    const durationMs = endEpoch - startEpoch;

    if (durationMs < 30 * 60 * 1000) {
      toast.error("A slot must be at least 30 minutes long");
      return;
    }

    setCreatingSlot(true);

    try {
      const slotInput: CreateCoachSlotInput = {
        date: newSlotDate,
        startEpoch,
        endEpoch,
      };

      const res = await coachApi.createSlot(slotInput);

      if (res.success) {
        toast.success("Slot added successfully!");

        fetchMySlots(filterDate);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create slot");
    } finally {
      setCreatingSlot(false);
    }
  };

  const handleCancelSlot = async (slotId: string) => {
    setCancellingSlotId(slotId);

    try {
      const res = await coachApi.cancelSlot(slotId);

      if (res.success) {
        toast.info("Slot cancelled");

        fetchMySlots(filterDate);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel slot");
    } finally {
      setCancellingSlotId(null);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    setProcessingRequestId(requestId);

    try {
      const res = await coachApi.updateSessionRequestStatus(requestId, status);

      if (res.success) {
        if (status === "approved") {
          toast.success("Session request approved!");
        } else {
          toast.info("Session request rejected.");
        }

        fetchMyRequests();
        fetchMySlots(filterDate);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update session request",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleFilterDateChange = (date: string) => {
    setFilterDate(date);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    fetchMySlots(date);
  };

  const handleClearFilter = () => {
    setFilterDate("");
    setCurrentPage(1);
    setCursorHistory([undefined]);
    fetchMySlots("");
  };

  const pendingRequestsCount = requests.filter(
    (r) => r.status === "pending",
  ).length;

  if (!user || user.role !== "coach") {
    return <AccessDeniedCard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingRequestsCount={pendingRequestsCount}
        />

        {/* Tab 1: Slots Management */}
        {activeTab === "slots" ? (
          <div className="space-y-8">
            <CreateSlotForm
              todayStr={todayStr}
              newSlotDate={newSlotDate}
              startTimeStr={startTimeStr}
              endTimeStr={endTimeStr}
              creatingSlot={creatingSlot}
              onDateChange={setNewSlotDate}
              onStartTimeChange={setStartTimeStr}
              onEndTimeChange={setEndTimeStr}
              onSubmit={handleCreateSlot}
            />

            <SlotListSection
              slots={slots}
              loadingSlots={loadingSlots}
              loadingPage={loadingPage}
              currentPage={currentPage}
              hasNextSlots={hasNextSlots}
              filterDate={filterDate}
              cancellingSlotId={cancellingSlotId}
              onFilterDateChange={handleFilterDateChange}
              onClearFilter={handleClearFilter}
              onCancelSlot={handleCancelSlot}
              onPreviousPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div>
        ) : null}

        {/* Tab 2: Session Requests */}
        {activeTab === "requests" ? (
          <SessionRequestsSection
            requests={requests}
            loadingRequests={loadingRequests}
            processingRequestId={processingRequestId}
            onApprove={(id) => handleUpdateRequestStatus(id, "approved")}
            onReject={(id) => handleUpdateRequestStatus(id, "rejected")}
          />
        ) : null}

        {/* Tab 3: Coach Profile */}
        {activeTab === "profile" ? (
          <CoachProfileForm
            profile={profile}
            loadingProfile={loadingProfile}
            savingProfile={savingProfile}
            bio={bio}
            experience={experience}
            sportsInput={sportsInput}
            centerName={centerName}
            centerAddress={centerAddress}
            centerCity={centerCity}
            centerState={centerState}
            profileImages={profileImages}
            onBioChange={setBio}
            onExperienceChange={setExperience}
            onSportsInputChange={setSportsInput}
            onCenterNameChange={setCenterName}
            onCenterAddressChange={setCenterAddress}
            onCenterCityChange={setCenterCity}
            onCenterStateChange={setCenterState}
            onImagesChange={setProfileImages}
            onSubmit={handleSaveProfile}
          />
        ) : null}
      </div>
    </div>
  );
}
