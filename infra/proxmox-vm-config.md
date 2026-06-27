# Proxmox "Create VM" config — REREVI

> Exact values for the Proxmox **Create VM** wizard. Prereq: upload a **Debian 12
> (Bookworm) netinst ISO** to a Proxmox storage first (Datacenter → storage →
> ISO Images → Upload).

| Wizard tab | Field | Value |
|------------|-------|-------|
| **General** | Node | your Proxmox node |
| | VM ID | leave default (e.g. 100) |
| | Name | `rerevi` |
| | Start at boot | ✔ (set later in Options if not shown) |
| **OS** | Use CD/DVD ISO | the **Debian 12 netinst** ISO |
| | Guest OS Type | Linux |
| | Version | 6.x - 2.6 Kernel |
| **System** | Graphic card | Default |
| | Machine | `q35` |
| | BIOS | **SeaBIOS** (default — no EFI disk needed) |
| | SCSI Controller | **VirtIO SCSI single** |
| | Qemu Agent | **✔** |
| **Disks** | Bus/Device | **SCSI** (`scsi0`) |
| | Storage | your SSD/NVMe-backed storage (e.g. `local-lvm`) |
| | Disk size (GiB) | **240** |
| | Cache | Default (No cache) |
| | Discard | **✔** |
| | SSD emulation | **✔** |
| | IO thread | ✔ |
| **CPU** | Sockets | 1 |
| | Cores | **4** |
| | Type | **`host`** |
| **Memory** | Memory (MiB) | **8192** |
| | Ballooning Device | **uncheck** (disable — predictable Postgres RAM) |
| **Network** | Bridge | `vmbr0` |
| | Model | **VirtIO (paravirtualized)** |
| | Firewall | optional (we use UFW inside the VM + Cloudflare Tunnel) |
| **Confirm** | Start after created | ✔ |

Notes:
- **CPU `host`** gives best performance; only downside is live-migration across
  *different* CPU models — fine on a single host.
- **No port-forwarding / no public IP** is needed — public access is via the
  Cloudflare Tunnel (set up after the OS is installed). The VM just needs LAN +
  internet (DHCP is fine; a static lease/IP is nicer so its address is stable).

## Debian install choices (when the VM boots the ISO)
- Hostname `rerevi`; set a root password and create a user (e.g. `zafir`).
- Software selection: **uncheck desktop**, **check "SSH server"** + standard system
  utilities. (Minimal install.)
- After first boot, note the VM's **IP address** (`ip a`).

## Handing SSH access to Claude (next step)
I drive the VM by running `ssh` from your **Mac's** terminal (the Bash tool), so the
Mac just needs key-based SSH into the VM:
```bash
# On your Mac, once the VM is up:
ssh-copy-id zafir@<vm-ip>      # or add your existing key to the VM
ssh zafir@<vm-ip> 'echo ok'    # confirm passwordless login works
```
Then tell me the **VM IP** and **username**, and I'll take over from Phase 2
(Docker) onward, documenting each step in `infra/SETUP-LOG.md`.
