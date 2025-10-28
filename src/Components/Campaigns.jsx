import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);

  const API_BASE = "https://bzbackend.online/api";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(response.data);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    }
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    if (!subject || !body) {
      toast.error("Subject and body are required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/campaigns`,
        { subject, body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Campaign created successfully");
      setSubject("");
      setBody("");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId) => {
    setSending(campaignId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/campaigns/${campaignId}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Campaign sent successfully");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to send campaign");
    } finally {
      setSending(null);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Email Campaigns</h1>

      {/* Create Campaign Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
        <form onSubmit={createCampaign}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email subject"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email Body (Plain Text)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter plain text email content. For testing: localhost303"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Campaigns</h2>
        </div>
        <div className="p-6">
          {campaigns.length === 0 ? (
            <p className="text-gray-500">No campaigns created yet.</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{campaign.subject}</h3>
                    <div className="flex space-x-2">
                      {!campaign.sentAt ? (
                        <button
                          onClick={() => sendCampaign(campaign._id)}
                          disabled={sending === campaign._id}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:opacity-50 text-sm"
                        >
                          {sending === campaign._id ? "Sending..." : "Send"}
                        </button>
                      ) : (
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                          Sent to {campaign.recipientCount} users
                        </span>
                      )}
                      <button
                        onClick={() => deleteCampaign(campaign._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Created by: {campaign.createdBy?.username || "Unknown"} on{" "}
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                  {campaign.sentAt && (
                    <p className="text-sm text-green-600">
                      Sent on: {new Date(campaign.sentAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{campaign.body}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
