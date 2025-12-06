import React, { useEffect, useState } from "react";

const API_BASE = "https://bzbackend.online/api/analytics";

// No token headers — dashboard uses dummy localStorage login

const Activity = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState("");
  const [groupBySession, setGroupBySession] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(100);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartItems, setCartItems] = useState(null);
  const [selectedCartUser, setSelectedCartUser] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [dashboardSecret, setDashboardSecret] = useState(
    localStorage.getItem("ANALYTICS_DASHBOARD_SECRET") || ""
  );

  const fetchSummary = async () => {
    try {
      // fetch with optional dashboard secret header (read from localStorage)
      const secret = localStorage.getItem("ANALYTICS_DASHBOARD_SECRET");
      const headers = secret ? { "x-dashboard-secret": secret } : {};
      const res = await fetch(`${API_BASE}/summary`, { headers });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch analytics summary", err);
    }
  };

  // fetchEvents accepts optional overrides: { user_id, guest_id }
  // fetchEvents accepts optional overrides: { user_id, guest_id }
  // options: { limitOverride: number, includeDateRange: boolean }
  const fetchEvents = async (overrides = {}, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      // fetch without Authorization header — dashboard uses dummy login
      const params = new URLSearchParams();
      const useLimit = options.limitOverride ?? limit ?? 100;
      params.set("limit", String(useLimit));
      if (eventType) params.set("event_type", eventType);
      // when fetching for a specific visitor, fetch all available events (skip date range unless explicitly requested)
      if (
        options.includeDateRange ||
        (!overrides.user_id && !overrides.guest_id)
      ) {
        if (startDate) params.set("start", new Date(startDate).toISOString());
        if (endDate) params.set("end", new Date(endDate).toISOString());
      }
      if (overrides.user_id) params.set("user_id", overrides.user_id);
      if (overrides.guest_id) params.set("guest_id", overrides.guest_id);

      const secret = localStorage.getItem("ANALYTICS_DASHBOARD_SECRET");
      const headers = secret ? { "x-dashboard-secret": secret } : {};
      const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
        headers,
      });
      const data = await res.json();
      // if we requested events for a particular user/guest, set selectedVisitor state
      if (overrides.user_id || overrides.guest_id) {
        setSelectedVisitor({
          id: overrides.user_id || overrides.guest_id,
          guest: !!overrides.guest_id,
        });
      }
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch analytics events", err);
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart for a specific user (user_id or guest_id)
  const fetchCartForUser = async (user) => {
    setCartLoading(true);
    setCartItems(null);
    try {
      const secret = localStorage.getItem("ANALYTICS_DASHBOARD_SECRET");
      const headers = secret ? { "x-dashboard-secret": secret } : {};
      const q = user.guest
        ? `?guest_id=${encodeURIComponent(user.id)}`
        : `?user_id=${user.id}`;
      const res = await fetch(`${API_BASE}/cart${q}`, { headers });
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      setSelectedCartUser(user);
    } catch (err) {
      console.error("Failed to fetch cart for user", err);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    // fetch once on mount. Activity should not auto-refresh — only refresh on user action
    fetchSummary();
    fetchEvents();
    fetchMonthly();
  }, []);

  // NO polling — Activity refresh is manual by clicking the Refresh button

  const fetchMonthly = async () => {
    try {
      const secret = localStorage.getItem("ANALYTICS_DASHBOARD_SECRET");
      const headers = secret ? { "x-dashboard-secret": secret } : {};
      const res = await fetch(`${API_BASE}/monthly`, { headers });
      const data = await res.json();
      setMonthly(data);
    } catch (err) {
      console.error("Failed to fetch monthly stats", err);
    }
  };

  // Helpers
  const formatDuration = (ms) => {
    if (ms == null) return "";
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Group events by session id when requested
  const grouped = groupBySession
    ? events.reduce((acc, e) => {
        const sid =
          e.session_id || `no-session-${e.user_id || e.guest_id || "anon"}`;
        acc[sid] = acc[sid] || [];
        acc[sid].push(e);
        return acc;
      }, {})
    : {};

  // Derive a short visitors list (unique users / guests) from events
  const visitors = Object.values(
    events.reduce((acc, e) => {
      const uid = e.user_id
        ? `user:${e.user_id}`
        : e.guest_id
        ? `guest:${e.guest_id}`
        : null;
      if (!uid) return acc;
      if (!acc[uid]) {
        const isGuest = uid.startsWith("guest:");
        acc[uid] = {
          id: uid.split(":")[1],
          guest: isGuest,
          count: 0,
          display:
            e.user_display || (isGuest ? `guest:${uid.split(":")[1]}` : ""),
          lastSeen: e.createdAt,
        };
      }
      acc[uid].count += 1;
      if (new Date(e.createdAt) > new Date(acc[uid].lastSeen))
        acc[uid].lastSeen = e.createdAt;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  // Nicely format device metadata; fall back to UA sniffing when os_name missing
  const formatMeta = (meta = {}) => {
    if (!meta) return "";
    const { os_name, os_version, device_type, ua, device_model } = meta || {};
    let name = os_name || "";
    // try UA sniff as fallback for missing os_name
    if (!name && ua && typeof ua === "string") {
      const l = ua.toLowerCase();
      if (
        l.includes("iphone") ||
        l.includes("cpu iphone os") ||
        l.includes("iphone os")
      ) {
        name = "iOS";
      } else if (l.includes("ipad") || l.includes("cpu os")) {
        name = "iOS";
      } else if (l.includes("android")) {
        name = "Android";
      } else if (l.includes("windows")) {
        name = "Windows";
      } else if (l.includes("mac os x") || l.includes("macintosh")) {
        name = "macOS";
      }
    }

    const ver = os_version ? ` ${os_version}` : "";
    const model = device_model ? ` — ${device_model}` : "";
    const device = device_type ? ` (${device_type})` : "";
    return name ? `${name}${ver}${device}${model}` : model || "";
  };

  // Render short product / event summary for table cells (prefer product_name over id)
  const renderShortData = (d = {}) => {
    if (!d) return "";
    if (d.product_name)
      return `${d.product_name}${d.price ? ` — Rs ${d.price}` : ""}`;
    if (d.product_id) return String(d.product_id);
    if (d.cart_item_count) return `items: ${d.cart_item_count}`;
    return JSON.stringify(d || {});
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Activity / Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Unique Users</div>
          <div className="text-2xl font-bold">
            {summary ? summary.uniqueUsers : "—"}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Avg Session (ms)</div>
          <div className="text-2xl font-bold">
            {summary ? Math.round(summary.avgSessionDurationMs) : "—"}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Session samples</div>
          <div className="text-2xl font-bold">
            {summary ? summary.sessionSamples : "—"}
          </div>
        </div>
        {/* Monthly totals */}
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Visitors (30d)</div>
          <div className="text-2xl font-bold">
            {monthly ? monthly.totals.visitors : "—"}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Adds to cart (30d)</div>
          <div className="text-2xl font-bold">
            {monthly ? monthly.totals.add_to_cart : "—"}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Purchases (30d)</div>
          <div className="text-2xl font-bold">
            {monthly ? monthly.totals.order_placed : "—"}
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={groupBySession}
                onChange={(e) => setGroupBySession(e.target.checked)}
              />
              <span>Group by session</span>
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">All types</option>
                <option value="click">click</option>
                <option value="scroll">scroll</option>
                <option value="page_view">page_view</option>
                <option value="page_duration">page_duration</option>
                <option value="session_start">session_start</option>
                <option value="session_end">session_end</option>
                <option value="add_to_cart">add_to_cart</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />

              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value || 100))}
                className="w-20 border rounded px-3 py-2 text-sm"
                min="10"
                max="1000"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Dashboard secret (optional)"
                value={dashboardSecret}
                onChange={(e) => setDashboardSecret(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  if (!dashboardSecret) {
                    localStorage.removeItem("ANALYTICS_DASHBOARD_SECRET");
                  } else {
                    localStorage.setItem(
                      "ANALYTICS_DASHBOARD_SECRET",
                      dashboardSecret
                    );
                  }
                  fetchEvents();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save Secret
              </button>
            </div>

            <button
              onClick={() => fetchEvents()}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                if (!events || !events.length) return;
                const rows = [
                  [
                    "time",
                    "type",
                    "user",
                    "user_display",
                    "url",
                    "duration_ms",
                    "device",
                    "device_model",
                    "location",
                    "data",
                  ],
                  ...events.map((e) => [
                    new Date(e.createdAt).toISOString(),
                    e.event_type,
                    e.user_id || e.guest_id || "anon",
                    e.user_display || "",
                    e.url || "",
                    e.duration_ms || "",
                    formatMeta(e.meta),
                    e.meta?.device_model || "",
                    e.meta?.location
                      ? `${e.meta.location.city || ""}${
                          e.meta.location.region
                            ? ", " + e.meta.location.region
                            : ""
                        }${
                          e.meta.location.country
                            ? ", " + e.meta.location.country
                            : ""
                        }`
                      : "",
                    JSON.stringify(e.data || {}),
                  ]),
                ];

                const csvContent = rows
                  .map((r) =>
                    r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
                  )
                  .join("\n");
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analytics_events_${new Date().toISOString()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              disabled={!events || !events.length}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Visitors list + cart modal */}
      {visitors && visitors.length > 0 && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 p-3 border rounded bg-gray-50">
            <div className="text-sm font-semibold mb-2">Visitors</div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {visitors.map((v) => (
                <div
                  key={(v.guest ? "guest:" : "user:") + v.id}
                  className="flex items-center justify-between gap-2 p-2 bg-white rounded"
                >
                  <div className="text-xs">
                    <div className="font-medium truncate">
                      {v.display || v.id}
                    </div>
                    <div className="text-gray-500">Events: {v.count}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // fetch all events for this visitor (ignore date filters)
                        if (v.guest)
                          fetchEvents(
                            { guest_id: v.id },
                            { limitOverride: 1000 }
                          );
                        else
                          fetchEvents(
                            { user_id: v.id },
                            { limitOverride: 1000 }
                          );
                        setSelectedVisitor({
                          id: v.id,
                          guest: v.guest,
                          display: v.display,
                        });
                        setSelectedEvent(null);
                      }}
                      className="px-2 py-1 text-xs rounded bg-primary text-white"
                    >
                      Show
                    </button>
                    <button
                      onClick={() =>
                        fetchCartForUser({ id: v.id, guest: v.guest })
                      }
                      className="px-2 py-1 text-xs rounded bg-gray-200"
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 p-3 border rounded bg-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-gray-500">
                  Click a visitor to filter events
                </div>
                <div className="text-xs text-gray-400">
                  Use "View Cart" to open the server-side cart snapshot.
                </div>
              </div>
              {selectedVisitor ? (
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Showing:{" "}
                    {selectedVisitor.display ||
                      (selectedVisitor.guest
                        ? `guest:${selectedVisitor.id}`
                        : selectedVisitor.id)}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedVisitor(null);
                        fetchEvents();
                      }}
                      className="px-2 py-1 text-xs rounded bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            {selectedVisitor && (
              <div className="mb-2 text-sm text-gray-600">
                Total time on site (from events):{" "}
                {(() => {
                  const totalMs = events.reduce(
                    (acc, e) => acc + (e.duration_ms || 0),
                    0
                  );
                  if (!totalMs) return "0s";
                  const s = Math.floor(totalMs / 1000);
                  const m = Math.floor(s / 60);
                  const sec = s % 60;
                  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Cart modal */}
      {selectedCartUser && cartItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-auto max-h-[85vh] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">
                  Cart for {selectedCartUser.display || selectedCartUser.id}
                </h3>
                <div className="text-xs text-gray-500">
                  {selectedCartUser.guest ? "guest" : "user"}:{" "}
                  {selectedCartUser.id}
                </div>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectedCartUser(null);
                    setCartItems(null);
                  }}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            {cartLoading ? (
              <div className="text-gray-500">Loading cart...</div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="text-gray-500">No cart items found</div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((it) => {
                  // Defensive rendering: some cart items include a full product object in product_id
                  const prodObj =
                    it.product_id && typeof it.product_id === "object"
                      ? it.product_id
                      : null;
                  const name =
                    typeof it.product_name === "string"
                      ? it.product_name
                      : prodObj
                      ? prodObj.product_name ||
                        prodObj.product_code ||
                        prodObj._id
                      : typeof it.product_id === "string"
                      ? it.product_id
                      : it._id || "item";
                  const img =
                    it.selected_image ||
                    (prodObj &&
                      Array.isArray(prodObj.product_images) &&
                      prodObj.product_images[0]) ||
                    "";
                  const price =
                    it.price ||
                    (prodObj &&
                      (prodObj.product_discounted_price ||
                        prodObj.product_base_price)) ||
                    null;
                  const key = it._id || (prodObj && prodObj._id) || name;

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt="product"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : null}
                      <div>
                        <div className="font-semibold">{name}</div>
                        <div className="text-xs text-gray-500">
                          Qty: {it.quantity ?? "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Size: {it.selected_size ?? "-"}
                        </div>
                      </div>
                      <div className="ml-auto text-sm text-gray-700">
                        {price ? `Rs. ${price}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-auto max-h-[85vh] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Event Details</h3>
                <div className="text-xs text-gray-500">{selectedEvent._id}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  {selectedEvent.event_type}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-semibold mb-2">
                  {new Date(selectedEvent.createdAt).toLocaleString()}
                </div>

                <div className="text-xs text-gray-500">User</div>
                <div className="mb-2">
                  {selectedEvent.user_display ||
                    selectedEvent.user_id ||
                    selectedEvent.guest_id ||
                    "anon"}
                </div>

                <div className="text-xs text-gray-500">URL</div>
                <div className="mb-2 text-primary truncate max-w-[420px]">
                  {selectedEvent.url}
                </div>

                <div className="text-xs text-gray-500">Device</div>
                <div className="mb-2">{formatMeta(selectedEvent.meta)}</div>
                {selectedEvent.meta?.location && (
                  <div className="text-xs text-gray-500">Location</div>
                )}
                {selectedEvent.meta?.location && (
                  <div className="mb-2 text-sm text-gray-600">{`${
                    selectedEvent.meta.location.city || ""
                  }${
                    selectedEvent.meta.location.region
                      ? ", " + selectedEvent.meta.location.region
                      : ""
                  }${
                    selectedEvent.meta.location.country
                      ? ", " + selectedEvent.meta.location.country
                      : ""
                  }`}</div>
                )}

                <div className="text-xs text-gray-500">Duration</div>
                <div className="mb-2">
                  {selectedEvent.duration_ms
                    ? formatDuration(selectedEvent.duration_ms)
                    : "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Data / Payload</div>
                <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-[50vh]">
                  {JSON.stringify(selectedEvent.data || {}, null, 2)}
                </pre>

                {/* Show products if present (orders / cashout / cart_snapshot) */}
                {selectedEvent.data?.products &&
                  Array.isArray(selectedEvent.data.products) &&
                  selectedEvent.data.products.length > 0 && (
                    <div className="mt-3 border rounded p-3 bg-white">
                      <div className="text-sm font-semibold mb-2">Products</div>
                      <div className="space-y-2">
                        {selectedEvent.data.products.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 border rounded"
                          >
                            {p.selected_image ? (
                              <img
                                src={p.selected_image}
                                alt="product"
                                className="w-14 h-14 object-cover rounded"
                              />
                            ) : null}
                            <div>
                              <div className="font-semibold text-sm">
                                {p.product_name || p.product_id || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Qty: {p.quantity ?? "-"}
                              </div>
                            </div>
                            <div className="ml-auto text-sm text-gray-700">
                              {p.price ? `Rs. ${p.price}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedEvent.data?.cart_snapshot &&
                  Array.isArray(selectedEvent.data.cart_snapshot) &&
                  selectedEvent.data.cart_snapshot.length > 0 && (
                    <div className="mt-3 border rounded p-3 bg-white">
                      <div className="text-sm font-semibold mb-2">
                        Cart snapshot
                      </div>
                      <div className="space-y-2">
                        {selectedEvent.data.cart_snapshot.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 border rounded"
                          >
                            {it.selected_image ? (
                              <img
                                src={it.selected_image}
                                alt="product"
                                className="w-14 h-14 object-cover rounded"
                              />
                            ) : null}
                            <div>
                              <div className="font-semibold text-sm">
                                {it.product_name || it.product_id || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Qty: {it.quantity ?? "-"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Size: {it.selected_size ?? "-"}
                              </div>
                            </div>
                            <div className="ml-auto text-sm text-gray-700">
                              {it.price ? `Rs. ${it.price}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Nice add_to_cart presentation if available */}
                {selectedEvent.event_type === "add_to_cart" &&
                  (selectedEvent.data?.product_name ||
                    selectedEvent.data?.product_id) && (
                    <div className="mt-3 border rounded p-3 bg-white">
                      <div className="flex items-center gap-3">
                        {selectedEvent.data?.selected_image ? (
                          <img
                            src={selectedEvent.data.selected_image}
                            alt="product"
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : null}
                        <div>
                          <div className="font-semibold text-lg">
                            {selectedEvent.data?.product_name ||
                              selectedEvent.data?.product_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {selectedEvent.data?.quantity ?? "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cart items:{" "}
                            {selectedEvent.data?.cart_item_count ?? "-"}
                          </div>
                          <div className="text-sm text-gray-700">
                            Price:{" "}
                            {selectedEvent.data?.price
                              ? `Rs. ${selectedEvent.data.price}`
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading events...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          No events found for the selected filters.
        </div>
      ) : (
        <div className="overflow-auto max-h-[65vh] border rounded bg-white">
          {/* Sessions / Events */}
          {groupBySession ? (
            <div className="p-3 space-y-3">
              {Object.keys(grouped).length === 0 && (
                <div className="text-sm text-gray-500 p-3">
                  No sessions found
                </div>
              )}
              {Object.entries(grouped).map(([sid, sessEvents]) => (
                <div key={sid} className="border rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                      Session: <strong className="text-primary">{sid}</strong>
                    </div>
                    <div className="text-xs text-gray-500">
                      Events: {sessEvents.length} — User:{" "}
                      {sessEvents[0]?.user_display ||
                        sessEvents[0]?.guest_id ||
                        "anon"}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sessEvents.slice(0, 20).map((e) => (
                      <div
                        key={e._id}
                        className="p-2 border rounded-md hover:shadow-md cursor-pointer"
                        onClick={() => setSelectedEvent(e)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs text-gray-500">
                            {new Date(e.createdAt).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {e.event_type}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {e.url || "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {e.user_display || e.guest_id || "anon"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatMeta(e.meta)}
                        </div>
                        {e.meta?.location && (
                          <div className="text-xs text-gray-400 mt-1">{`${
                            e.meta.location.city || ""
                          }${
                            e.meta.location.region
                              ? ", " + e.meta.location.region
                              : ""
                          }${
                            e.meta.location.country
                              ? ", " + e.meta.location.country
                              : ""
                          }`}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">User Name</th>
                  <th className="p-2 text-left">URL</th>
                  <th className="p-2 text-left">Duration</th>
                  <th className="p-2 text-left">Actions</th>
                  <th className="p-2 text-left">Device</th>
                  <th className="p-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id} className="border-t">
                    <td className="p-2">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">{e.event_type}</td>
                    <td className="p-2">{e.user_id || e.guest_id || "anon"}</td>
                    <td className="p-2">{e.user_display || ""}</td>
                    <td className="p-2 truncate max-w-[300px]">{e.url}</td>
                    <td className="p-2">
                      {e.duration_ms ? formatDuration(e.duration_ms) : ""}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => setSelectedEvent(e)}
                        className="px-2 py-1 text-xs rounded bg-primary text-white"
                      >
                        Details
                      </button>
                    </td>

                    <td className="p-2">{formatMeta(e.meta)}</td>
                    <td className="p-2 truncate max-w-[300px]">
                      {renderShortData(e.data)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Activity;
