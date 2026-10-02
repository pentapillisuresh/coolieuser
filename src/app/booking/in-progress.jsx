// /booking/in-progress

import { useState, useEffect } from "react";
import {View,Text,TouchableOpacity,Alert,StatusBar,Linking,ActivityIndicator} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import {  getJobById, completeJob, generateCompleteOTP  } from "../../../services/api/job";

export default function InProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawJobData = params?.jobData;
  
  let jobID;
  
  try {
    jobID =
      typeof rawJobData === "string"
        ? JSON.parse(rawJobData)
        : rawJobData;
  } catch (error) {
    console.error("jobData JSON parse error:", error);
    return;
  }  
  const jobId = String(jobID?.Job?.id ?? "");

  const [job, setJob] = useState(null);
  const [worker, setWorker] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  /**
   * Get job data
   */
  useEffect(() => {
    if (!jobId) {
      Alert.alert("Error", "Job ID is missing.");
      router.back();
      return;
    }

    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);

      const jobData = await getJobById(jobId);

      if (!jobData) {
        Alert.alert("Error", "Job not found.");
        router.back();
        return;
      }

      setJob(jobData.data);
      setWorker(jobData.data.Worker)
      /**
       * If the job is not in progress,
       * redirect to the appropriate screen.
       */
      const status = String(jobData.data.status || "").toLowerCase();

      if (status !== "in-progress") {
        redirectAccordingToStatus(jobData.data.status, jobData.data);
        return;
      }

      /**
       * Calculate elapsed time from startedAt
       */
      if (jobData.startedAt) {
        const startedTime = new Date(jobData.startedAt).getTime();
        const currentTime = Date.now();

        const differenceInSeconds = Math.max(
          0,
          Math.floor((currentTime - startedTime) / 1000)
        );

        setElapsed(differenceInSeconds);
      } else {
        setElapsed(0);
      }
    } catch (error) {
      console.error("Failed to load job:", error);

      Alert.alert(
        "Error",
        "Unable to load job details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Redirect based on job status
   */
  const redirectAccordingToStatus = (status, jobData) => {
    const navigationParams = {
      jobId: String(jobData.id),
    };

    switch (status) {
      case "pending":
      case "accepted":
        router.replace({
          pathname: "/booking/accept",
          params: navigationParams,
        });
        break;

      case "arrived":
        console.log("jobData data::",jobData)
        router.replace({
          pathname: "/booking/arrived",
          params: { jobData: JSON.stringify(jobData) },
        });
        break;

      case "inprogress":
        // Stay on this screen
        break;

      case "completed":
        router.replace({
          pathname: "/booking/completed",
          params: navigationParams,
        });
        break;

      case "cancelled":
        router.replace({
          pathname: "/booking/cancelled",
          params: navigationParams,
        });
        break;

      default:
        console.log("Unknown job status:", status);
        break;
    }
  };

  /**
   * Keep timer running.
   *
   * IMPORTANT:
   * We don't increment from 0.
   * We calculate the difference between startedAt
   * and the current time every second.
   */
  useEffect(() => {
    if (!job?.startedAt) {
      return;
    }

    const updateElapsedTime = () => {
      const startedTime = new Date(job.startedAt).getTime();
      const currentTime = Date.now();

      const differenceInSeconds = Math.max(
        0,
        Math.floor((currentTime - startedTime) / 1000)
      );

      setElapsed(differenceInSeconds);
    };

    // Update immediately
    updateElapsedTime();

    // Then update every second
    const timer = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(timer);
  }, [job?.startedAt]);

  /**
   * Convert seconds to HH:MM:SS
   */
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const formattedTime = [
    String(hours).padStart(2, "0"),
    String(mins).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");

  /**
   * Complete job
   */
  const handleVerifyCompleteJob = async () => {
    if (!jobId || !job) {
      return;
    }

    try {
      setCompleting(true);
      const verifyCompletionJob = await generateCompleteOTP(jobId);
      console.log("verifyCompletionJob::",verifyCompletionJob)
      // setJob(verifyCompletionJob || { ...job, status: "completed" });
      router.replace({
        pathname: "/booking/work-otp",
        params: {
          jobId: String(jobId),
        },
      });
    } catch (error) {
      console.error("Failed to complete job:", error);

      Alert.alert(
        "Unable to complete",
        "The job could not be marked as completed. Please try again."
      );
    } finally {
      setCompleting(false);
    }
  };

  /**
   * Call support
   */
  const handleSupport = () => {
    Linking.openURL("tel:94941303830").catch(() => {
      Alert.alert(
        "Support",
        "Unable to open the phone dialer."
      );
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F8EF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />

        <Text
          style={{
            marginTop: 12,
            fontSize: 15,
            color: "#374151",
          }}
        >
          Loading job...
        </Text>
      </View>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#17381B",
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          Work In Progress
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {job.serviceName || "Fan Installation"}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
          gap: 16,
        }}
      >
        {/* Timer */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "#E8F5E9",
              borderWidth: 4,
              borderColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon2
              name="timer"
              size={28}
              color="#17381B"
            />

            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#17381B",
                marginTop: 4,
              }}
            >
              {formattedTime}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1F2937",
            }}
          >
            Work In Progress
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              backgroundColor: "#DCFCE7",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#16A34A",
              }}
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#16A34A",
              }}
            >
              Active
            </Text>
          </View>
        </View>

        {/* Worker */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              backgroundColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 26,
                color: "#FFFFFF",
              }}
            >
              {worker.User.name.charAt(0)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#1F2937",
              }}
            >
              {worker.User.name}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginTop: 2,
              }}
            >
              Working on your{" "}
              {job.serviceName || "service"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
          }}
        >
          {/* <TouchableOpacity
            onPress={() =>
              Alert.alert("Chat", "Opening chat...")
            }
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon
              name="message-square"
              size={20}
              color="#17381B"
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#17381B",
              }}
            >
              Chat
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={handleSupport}
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon
              name="phone"
              size={20}
              color="#2ECC71"
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#2ECC71",
              }}
            >
              Support
            </Text>
          </TouchableOpacity>
        </View>

        {/* Safety tips */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Icon3
              name="shield-alt"
              size={16}
              color="#17381B"
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#17381B",
              }}
            >
              Safety Tips
            </Text>
          </View>

          {[
            "Do not make extra cash payments",
            "Keep the booking ID handy",
            "Rate your experience after work",
          ].map((tip, i) => (
            <Text
              key={i}
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 22,
              }}
            >
              • {tip}
            </Text>
          ))}
        </View>

        {/* Complete */}
        <TouchableOpacity
          onPress={handleVerifyCompleteJob}
          disabled={completing}
          activeOpacity={0.85}
          style={{
            marginTop: 16,
            opacity: completing ? 0.7 : 1,
          }}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: "#16A34A",
              shadowColor: "#16A34A",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {completing ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#FFFFFF",
                  }}
                >
                  Verify Completed Work
                </Text>

                <Icon
                  name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
